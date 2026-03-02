import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ShopService, Shop } from '../../../../services/shop.service';
import { BoutiqueService, Boutique } from '../../../../services/boutique.service';
import { DomaineService, Domaine } from '../../../../services/domaine.service';
import { ProductService, Product } from '../../../../services/product.service';
import { TypeService, Type } from '../../../../services/type.service';
import { OrderService, Order } from '../../../../services/order.service';
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
  newBoutique = { name: '', description: '', id_domaine: '' };

  isEditingBoutique = false;
  editedBoutique: Partial<Boutique> = {};

  showCreateProductForm = false;

  // Import CSV/Excel
  importLoading = false;
  importError: string = '';
  importSuccess: string = '';

  // Stats globales (toutes boutiques du manager)
  caToday: number = 0;
  caTodayChange: number = 0;
  lowStockCount: number = 0;
  pendingOrders: number = 0;
  newClients30d: number = 0;

  topProducts: { product: Product; quantity: number }[] = [];
  recentOrders: Order[] = [];
  alerts: string[] = [];

  constructor(
    private shopService: ShopService,
    private boutiqueService: BoutiqueService,
    private productService: ProductService,
    private typeService: TypeService,
    private domaineService: DomaineService,
    private orderService: OrderService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadGlobalStats();

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

  // ────────────── STATS GLOBALES (toutes les boutiques du manager) ──────────────
  private loadGlobalStats(): void {
    const user = this.authService.currentUser;
    if (!user?.id) {
      console.warn('Aucun user connecté → stats non chargées');
      return;
    }

    console.log('Début chargement stats globales pour user:', user.id);

    this.boutiqueService.getMyBoutiques(user.id).subscribe({
      next: (boutiques) => {
        console.log('Boutiques récupérées :', boutiques.length, boutiques);
        if (boutiques.length === 0) {
          console.log('Aucune boutique → stats à zéro');
          this.resetStats();
          return;
        }

        const productObservables = boutiques.map(b => {
          console.log('Chargement produits pour boutique:', b._id, b.name);
          return this.productService.getProductsByBoutique(b._id);
        });

        const ordersObservable = this.orderService.getOrdersByUser(user.id);
        ordersObservable.subscribe({
          next: orders => console.log('Commandes reçues pour user :', orders),
          error: err => console.error('Erreur getOrdersByUser :', err)
        });

        forkJoin([...productObservables, ordersObservable]).subscribe({
          next: (results: (Product[] | Order[])[]) => {
            console.log('Résultats forkJoin reçus :', results.length, 'tableaux');

            const allProducts = results.slice(0, -1).flat() as Product[];
            const allOrders = results[results.length - 1] as Order[];

            console.log('Total produits récupérés :', allProducts.length);
            console.log('Total commandes reçues :', allOrders.length);
            console.log('Commandes brutes :', allOrders);

            // CA TOTAL (toutes dates) – pour voir au moins 10000
            this.caToday = allOrders.reduce((sum: number, o: Order) => sum + (o.totalPrice || 0), 0);
            console.log('CA TOTAL (toutes dates) calculé :', this.caToday);

            // Commandes en attente : pending + confirmed
            this.pendingOrders = allOrders.filter((o: Order) => 
              o.status === 'pending' || o.status === 'confirmed'
            ).length;
            console.log('Commandes en attente (pending + confirmed) :', this.pendingOrders);

            // Stock faible : produits ≤ 5 unités
            this.lowStockCount = allProducts.filter(p => p.quantite <= 5).length;
            console.log('Produits en stock faible :', this.lowStockCount);

            // Top produits (toutes dates)
            const salesMap = new Map<string, number>();

            allOrders.forEach((o: Order) => {
              if (o.items) {
                o.items.forEach((item: any) => {
                  const prodId = item.product?._id;
                  if (prodId) {
                    salesMap.set(prodId, (salesMap.get(prodId) || 0) + (item.quantity || 0));
                  }
                });
              }
            });

            const top5Ids = [...salesMap.entries()]
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([id]) => id);

            this.topProducts = top5Ids.map(id => {
              const prod = allProducts.find(p => p._id === id);
              return { product: prod || { name: 'Produit inconnu' } as Product, quantity: salesMap.get(id)! };
            });
            console.log('Top produits (toutes dates) :', this.topProducts);

            // Dernières commandes (5 plus récentes, toutes dates)
            this.recentOrders = allOrders
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5);

            // Alertes
            this.alerts = [];

            // Alerte stock critique
            if (this.lowStockCount > 0) {
              this.alerts.push(`${this.lowStockCount} produit(s) en stock critique (≤ 5 unités)`);
            }

            // Autres alertes possibles
            if (this.pendingOrders > 10) {
              this.alerts.push(`${this.pendingOrders} commandes en attente – attention surcharge`);
            }

            console.log('Alertes générées :', this.alerts);

            console.log('Stats finales :', {
              caToday: this.caToday,
              lowStockCount: this.lowStockCount,
              pendingOrders: this.pendingOrders,
              topProducts: this.topProducts.length,
              recentOrders: this.recentOrders.length,
              alerts: this.alerts
            });
          },
          error: (err: any) => {
            console.error('Erreur forkJoin stats :', err);
            this.resetStats();
          }
        });
      },
      error: (err: any) => {
        console.error('Erreur getMyBoutiques :', err);
        this.resetStats();
      }
    });
  }

  private resetStats(): void {
    this.caToday = 0;
    this.caTodayChange = 0;
    this.lowStockCount = 0;
    this.pendingOrders = 0;
    this.newClients30d = 0;
    this.topProducts = [];
    this.recentOrders = [];
    this.alerts = [];
  }

  // Méthodes existantes (inchangées)
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