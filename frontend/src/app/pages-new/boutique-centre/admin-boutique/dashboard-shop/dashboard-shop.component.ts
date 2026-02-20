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
import { CreateProductComponent } from '../../..//boutique-centre/admin-boutique/product/create-product/create-product.component';
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
  shop: Shop | null = null;
  boutique: Boutique | null = null;
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

    this.domaineService.getAllDomaines().subscribe({
      next: (domaines) => {
        this.domaines = domaines;
        console.log('DOMAINES CHARGÉS :', domaines);
      },
      error: (err) => console.error('ERREUR DOMAINES :', err)
    });
  }

  private loadData(): void {
    const user = this.authService.currentUser;
    if (!user?.id_shop) {
      this.errorMessage = 'Aucune salle attribuée à votre compte.';
      this.loading = false;
      return;
    }

    this.shopService.getShopById(user.id_shop).subscribe({
      next: (shop) => {
        this.shop = shop;

        this.boutiqueService.getMyBoutique(user.id).subscribe({
          next: (boutique) => {
            this.boutique = boutique;
            this.loading = false;

            if (boutique) {
              this.productService.getProductsByShop(shop._id).subscribe({
                next: (prods) => this.products = prods,
                error: () => {}
              });
            }
          },
          error: () => {
            this.boutique = null;
            this.loading = false;
          }
        });
      },
      error: () => {
        this.errorMessage = 'Impossible de charger votre salle';
        this.loading = false;
      }
    });

    this.typeService.getAllTypes().subscribe(t => this.types = t);
  }

  createBoutique() {
    if (!this.shop || !this.newBoutique.name || !this.newBoutique.id_domaine) {
      this.errorMessage = 'Nom et domaine obligatoires';
      return;
    }

    const payload = {
      name: this.newBoutique.name,
      description: this.newBoutique.description || '',
      id_shop: this.shop._id,
      id_domaine: this.newBoutique.id_domaine
    };

    this.boutiqueService.createBoutique(payload).subscribe({
      next: (boutique) => {
        this.boutique = boutique;
        this.showCreateBoutique = false;
        this.newBoutique = { name: '', description: '', id_domaine: '' };
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur création boutique';
        console.error(err);
      }
    });
  }

  startEditBoutique() {
    if (!this.boutique) return;
    this.isEditingBoutique = true;
    this.editedBoutique = {
      name: this.boutique.name,
      description: this.boutique.description || '',
      id_domaine: this.boutique.id_domaine?._id || this.boutique.id_domaine || ''
    };
  }

  saveBoutiqueEdit() {
    if (!this.boutique || !this.editedBoutique.name || !this.editedBoutique.id_domaine) return;

    this.boutiqueService.updateBoutique(this.boutique._id, this.editedBoutique).subscribe({
      next: (updated) => {
        this.boutique = updated;
        this.isEditingBoutique = false;
        this.editedBoutique = {};
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur modification boutique';
        console.error(err);
      }
    });
  }

  cancelEditBoutique() {
    this.isEditingBoutique = false;
    this.editedBoutique = {};
  }

  onProductCreated(product: Product) {
    this.products.push(product);
    this.showCreateProductForm = false;
  }

  onProductUpdated(updated: Product) {
    const index = this.products.findIndex(p => p._id === updated._id);
    if (index !== -1) this.products[index] = updated;
  }

  onProductDeleted(id: string) {
    this.products = this.products.filter(p => p._id !== id);
  }

  logout() {
    this.authService.logout();
  }
}