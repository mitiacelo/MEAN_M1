import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ShopService, Shop } from '../../../../services/shop.service';
import { BoutiqueService, Boutique } from '../../../../services/boutique.service';
import { DomaineService, Domaine } from '../../../../services/domaine.service';
import { ProductService, Product } from '../../../../services/product.service';
import { TypeService, Type } from '../../../../services/type.service';
import { AuthService } from '../../../../services/auth.service';
import { CreateProductComponent } from '../../../boutique-centre/admin-boutique/product/create-product/create-product.component';
import { ProductListComponent } from '../../../boutique-centre/admin-boutique/product/product-list/product-list.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-dashboard-shop',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CreateProductComponent,
    ProductListComponent
  ],
  templateUrl: './dashboard-shop.component.html',
  styleUrl: './dashboard-shop.component.css'
})
export class DashboardShopComponent implements OnInit {
  shops: Shop[] = [];
  boutiquesMap: { [shopId: string]: Boutique | null } = {};
  selectedShop: Shop | null = null;
  selectedBoutique: Boutique | null = null;
  products: Product[] = [];
  types: Type[] = [];
  domaines: Domaine[] = [];
  loading = true;
  errorMessage = '';

  showCreateBoutique = false;
  newBoutique = {
    name: '',
    description: '',
    id_domaine: ''
  };

  isEditingBoutique = false;
  editedBoutique: Partial<Boutique> = {};

  showCreateProductForm = false;

  // Pour l'import CSV/Excel
  importLoading = false;
  importError: string = '';
  importSuccess: string = '';

  constructor(
    private shopService: ShopService,
    private boutiqueService: BoutiqueService,
    private productService: ProductService,
    private typeService: TypeService,
    private domaineService: DomaineService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();

    this.domaineService.getAllDomaines().subscribe(dom => this.domaines = dom);
    this.typeService.getAllTypes().subscribe(t => this.types = t);
  }

  private loadData(): void {
    const user = this.authService.currentUser;
    if (!user?.id) {
      this.errorMessage = 'Utilisateur non connecté';
      this.loading = false;
      return;
    }

    this.shopService.getShopsByUser(user.id).subscribe({
      next: (shops) => {
        this.shops = shops;

        shops.forEach(shop => {
          this.boutiqueService.getMyBoutique(user.id).subscribe({
            next: (boutique) => {
              if (boutique && boutique.id_shop?._id === shop._id) {
                this.boutiquesMap[shop._id] = boutique;
              } else {
                this.boutiquesMap[shop._id] = null;
              }
            },
            error: () => this.boutiquesMap[shop._id] = null
          });
        });

        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger vos salles';
        this.loading = false;
      }
    });
  }

  selectShop(shop: Shop): void {
    this.selectedShop = shop;
    this.selectedBoutique = this.boutiquesMap[shop._id] || null;
  
    if (this.selectedBoutique) {
      // ← CHANGEMENT : utilise getProductsByBoutique au lieu de getProductsByShop
      this.productService.getProductsByBoutique(this.selectedBoutique._id).subscribe({
        next: prods => {
          console.log(`Produits chargés pour boutique ${this.selectedBoutique?.name} :`, prods.length);
          this.products = prods;
        },
        error: err => {
          console.error('Erreur chargement produits boutique :', err);
          this.products = [];
        }
      });
    } else {
      this.products = [];
    }
  }

  createBoutique(): void {
    if (!this.selectedShop || !this.newBoutique.name || !this.newBoutique.id_domaine) {
      this.errorMessage = 'Sélectionnez une salle, nom et domaine obligatoires';
      return;
    }

    const payload = {
      name: this.newBoutique.name,
      description: this.newBoutique.description || '',
      id_shop: this.selectedShop._id,
      id_domaine: this.newBoutique.id_domaine
    };

    this.boutiqueService.createBoutique(payload).subscribe({
      next: (boutique) => {
        this.boutiquesMap[this.selectedShop!._id] = boutique;
        this.selectedBoutique = boutique;
        this.showCreateBoutique = false;
        this.newBoutique = { name: '', description: '', id_domaine: '' };
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur création boutique';
      }
    });
  }

  startEditBoutique(): void {
    if (!this.selectedBoutique) return;
    this.isEditingBoutique = true;
    this.editedBoutique = {
      name: this.selectedBoutique.name,
      description: this.selectedBoutique.description || '',
      id_domaine: this.selectedBoutique.id_domaine?._id || ''
    };
  }

  saveBoutiqueEdit(): void {
    if (!this.selectedBoutique || !this.editedBoutique.name || !this.editedBoutique.id_domaine) return;

    this.boutiqueService.updateBoutique(this.selectedBoutique._id, this.editedBoutique).subscribe({
      next: (updated) => {
        this.boutiquesMap[this.selectedShop!._id] = updated;
        this.selectedBoutique = updated;
        this.isEditingBoutique = false;
        this.editedBoutique = {};
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur modification';
      }
    });
  }

  cancelEditBoutique(): void {
    this.isEditingBoutique = false;
    this.editedBoutique = {};
  }

  onProductCreated(product: Product): void {
    this.products.push(product);
    this.showCreateProductForm = false;
  }

  onProductUpdated(updated: Product): void {
    const index = this.products.findIndex(p => p._id === updated._id);
    if (index !== -1) this.products[index] = updated;
  }

  onProductDeleted(id: string): void {
    this.products = this.products.filter(p => p._id !== id);
  }

  logout(): void {
    this.authService.logout();
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.selectedBoutique) return;
  
    this.importLoading = true;
    this.importError = '';
    this.importSuccess = '';
  
    const file = input.files[0];
    const reader = new FileReader();
  
    reader.onload = (e: any) => {
      try {
        const text = e.target.result as string;
    
        // Parsing CSV robuste (gère virgules internes et guillemets)
        const rows: string[][] = [];
        let currentRow: string[] = [];
        let currentField = '';
        let inQuotes = false;
    
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
    
          if (char === '"' && text[i - 1] !== '\\') {
            inQuotes = !inQuotes;
            continue;
          }
    
          if (char === ',' && !inQuotes) {
            currentRow.push(currentField);
            currentField = '';
            continue;
          }
    
          if ((char === '\n' || char === '\r') && !inQuotes) {
            currentRow.push(currentField);
            if (currentRow.some(f => f.trim() !== '')) {
              rows.push(currentRow);
            }
            currentRow = [];
            currentField = '';
            if (char === '\r' && text[i + 1] === '\n') i++; // skip \n après \r
            continue;
          }
    
          currentField += char;
        }
    
        // Dernière ligne
        if (currentField || currentRow.length > 0) {
          currentRow.push(currentField);
          if (currentRow.some(f => f.trim() !== '')) {
            rows.push(currentRow);
          }
        }
    
        if (rows.length < 2) {
          throw new Error('Fichier CSV vide ou sans en-tête');
        }
    
        // En-têtes
        const headers = rows[0].map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
    
        const payload: any[] = [];
    
        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].map(v => v.trim().replace(/^"|"$/g, ''));
    
          // Mappe les valeurs aux headers (tolère si plus ou moins)
          const row: any = {};
          for (let k = 0; k < headers.length && k < values.length; k++) {
            row[headers[k]] = values[k];
          }
    
          // Champs clés (tolérance aux noms différents)
          const name = row['name'] || row['nom'] || row['produit'] || '';
          const description = row['description'] || row['desc'] || '';
          const typeIdOrName = row['id_type'] || row['type'] || row['categorie'] || '';
          const quantiteStr = row['quantite'] || row['stock'] || row['qte'] || '0';
          const prixStr = row['prix'] || row['price'] || row['prix unitaire'] || '0';
    
          const quantite = Number(quantiteStr);
          const prix = Number(prixStr);
    
          const matchingType = this.types.find(t =>
            t._id === typeIdOrName ||
            t.name.toLowerCase() === typeIdOrName.toLowerCase()
          );
    
          if (!name || !matchingType || isNaN(quantite) || isNaN(prix)) {
            console.warn(`Ligne ${i + 1} ignorée (champs obligatoires manquants ou invalides) :`, row);
            continue;
          }
    
          payload.push({
            name,
            description,
            id_type: matchingType._id,
            id_boutique: this.selectedBoutique!._id,
            quantite,
            prix
          });
        }
    
        if (payload.length === 0) {
          this.importError = 'Aucun produit valide trouvé dans le fichier.';
          this.importLoading = false;
          input.value = '';
          return;
        }
    
        // Logs debug
        console.log('=== PAYLOAD ENVOYÉ AU BACKEND ===');
        console.log('Nombre produits :', payload.length);
        console.log('Premier :', payload[0]?.name || 'aucun');
        console.log('Deuxième :', payload[1]?.name || 'aucun');
        console.log('Troisième :', payload[2]?.name || 'aucun');
    
        const safePayload = JSON.parse(JSON.stringify(payload));
    
        this.productService.importProducts(safePayload).subscribe({
          next: (created) => {
            console.log('Import OK - Créés :', created.length);
            this.products = [...this.products, ...created];
            this.importSuccess = `${created.length} produit(s) importé(s) avec succès !`;
            this.importLoading = false;
            input.value = '';
          },
          error: (err) => {
            console.error('Erreur HTTP :', err);
            this.importError = err.error?.message || 'Erreur lors de l\'import';
            this.importLoading = false;
          }
        });
      } catch (err: any) {
        console.error('Erreur lecture CSV :', err);
        this.importError = err.message || 'Impossible de lire le fichier CSV.';
        this.importLoading = false;
        input.value = '';
      }
    };
  
    reader.readAsText(file);
  }
}