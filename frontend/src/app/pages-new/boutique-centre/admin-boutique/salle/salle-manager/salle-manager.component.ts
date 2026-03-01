import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ShopService, Shop } from '../../../../../services/shop.service';
import { BoutiqueService, Boutique } from '../../../../../services/boutique.service';
import { DomaineService, Domaine } from '../../../../../services/domaine.service';
import { ProductService, Product } from '../../../../../services/product.service';
import { TypeService, Type } from '../../../../../services/type.service';
import { AuthService } from '../../../../../services/auth.service';
import { CreateProductComponent } from '../../../../boutique-centre/admin-boutique/product/create-product/create-product.component';
import { ProductListComponent } from '../../../../boutique-centre/admin-boutique/product/product-list/product-list.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-salle-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CreateProductComponent,
    ProductListComponent
  ],
  templateUrl: './salle-manager.component.html',
  styleUrls: ['./salle-manager.component.css']
})
export class SalleManagerComponent implements OnInit {
  selectedShop: Shop | null = null;
  selectedBoutique: Boutique | null = null;
  products: Product[] = []; // ← changé en products (sans s)
  types: Type[] = [];
  domaines: Domaine[] = [];
  loading = true;
  errorMessage = '';

  // Création boutique
  showCreateBoutique = false;
  newBoutique = {
    name: '',
    description: '',
    id_domaine: ''
  };

  // Édition boutique
  isEditingBoutique = false;
  editedBoutique: Partial<Boutique> = {};

  // Gestion produits
  showCreateProductForm = false;
  importLoading = false;
  importError: string = '';
  importSuccess: string = '';

  constructor(
    private route: ActivatedRoute,
    private shopService: ShopService,
    private boutiqueService: BoutiqueService,
    private domaineService: DomaineService,
    private productService: ProductService,
    private typeService: TypeService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    // Charger domaines et types
    this.domaineService.getAllDomaines().subscribe(dom => this.domaines = dom);
    this.typeService.getAllTypes().subscribe(t => this.types = t);

    // Écoute les changements de paramètre :id
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const shopId = params.get('id');
        if (!shopId) {
          this.errorMessage = 'Aucune salle spécifiée';
          this.loading = false;
          return [];
        }
        this.loading = true;
        return this.shopService.getShopById(shopId);
      })
    ).subscribe({
      next: (shop: Shop | null) => {
        if (shop) {
          this.selectedShop = shop;
          this.loadBoutiqueAndProducts(shop._id);
        } else {
          this.errorMessage = 'Salle non trouvée';
          this.loading = false;
        }
      },
      error: () => {
        this.errorMessage = 'Erreur chargement salle';
        this.loading = false;
      }
    });
  }

  private loadBoutiqueAndProducts(shopId: string): void {
    const user = this.authService.currentUser;
    if (!user?.id) {
      this.loading = false;
      return;
    }

    this.boutiqueService.getMyBoutique(user.id).subscribe({
      next: (boutique) => {
        if (boutique && boutique.id_shop?._id === shopId) {
          this.selectedBoutique = boutique;
          this.loadProducts(boutique._id);
        } else {
          this.selectedBoutique = null;
          this.products = [];
        }
        this.loading = false;
      },
      error: () => {
        this.selectedBoutique = null;
        this.products = [];
        this.loading = false;
      }
    });
  }

  private loadProducts(boutiqueId: string): void {
    this.productService.getProductsByBoutique(boutiqueId).subscribe({
      next: prods => {
        this.products = prods;
        console.log('Produits chargés :', prods.length);
      },
      error: err => {
        console.error('Erreur chargement produits :', err);
        this.products = [];
      }
    });
  }

  // Création boutique
  createBoutique(): void {
    if (!this.selectedShop || !this.newBoutique.name || !this.newBoutique.id_domaine) {
      this.errorMessage = 'Nom et domaine obligatoires';
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
        this.selectedBoutique = boutique;
        this.showCreateBoutique = false;
        this.newBoutique = { name: '', description: '', id_domaine: '' };
        this.errorMessage = '';
        this.loadProducts(boutique._id);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur création boutique';
      }
    });
  }

  // Édition boutique
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

  // Gestion produits
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
            if (currentRow.some(f => f.trim() !== '')) rows.push(currentRow);
            currentRow = [];
            currentField = '';
            if (char === '\r' && text[i + 1] === '\n') i++;
            continue;
          }

          currentField += char;
        }

        if (currentField || currentRow.length > 0) {
          currentRow.push(currentField);
          if (currentRow.some(f => f.trim() !== '')) rows.push(currentRow);
        }

        if (rows.length < 2) throw new Error('Fichier CSV vide ou sans en-tête');

        const headers = rows[0].map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));

        const payload: any[] = [];

        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].map(v => v.trim().replace(/^"|"$/g, ''));

          const row: any = {};
          for (let k = 0; k < headers.length && k < values.length; k++) {
            row[headers[k]] = values[k];
          }

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
            console.warn(`Ligne ${i + 1} ignorée :`, row);
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
          this.importError = 'Aucun produit valide trouvé.';
          this.importLoading = false;
          input.value = '';
          return;
        }

        console.log('=== PAYLOAD ENVOYÉ ===');
        console.log('Nombre produits :', payload.length);

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
            console.error('Erreur import :', err);
            this.importError = err.error?.message || 'Erreur lors de l\'import';
            this.importLoading = false;
          }
        });
      } catch (err: any) {
        console.error('Erreur lecture CSV :', err);
        this.importError = err.message || 'Impossible de lire le fichier.';
        this.importLoading = false;
        input.value = '';
      }
    };

    reader.readAsText(file);
  }
}