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
  shops: Shop[] = [];                    // Toutes les salles de l'utilisateur
  boutiquesMap: { [shopId: string]: Boutique | null } = {}; // Boutique par salle (clé = shop._id)
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

    // Charger toutes les salles de l'utilisateur
    this.shopService.getShopsByUser(user.id).subscribe({
      next: (shops) => {
        this.shops = shops;

        // Charger la boutique pour CHAQUE salle
        shops.forEach(shop => {
          this.boutiqueService.getMyBoutique(user.id).subscribe({
            next: (boutique) => {
              // On associe la boutique à la salle si elle correspond
              if (boutique && boutique.id_shop?._id === shop._id) {
                this.boutiquesMap[shop._id] = boutique;
              } else {
                this.boutiquesMap[shop._id] = null;
              }
            },
            error: () => {
              this.boutiquesMap[shop._id] = null;
            }
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

  // Sélectionner une salle → afficher sa boutique (ou proposition de création)
  selectShop(shop: Shop): void {
    this.selectedShop = shop;
    this.selectedBoutique = this.boutiquesMap[shop._id] || null;

    if (this.selectedBoutique) {
      this.productService.getProductsByShop(shop._id).subscribe({
        next: prods => this.products = prods,
        error: () => this.products = []
      });
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
}