import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ShopService, Shop } from '../../../services/shop.service';
import { ProductService, Product } from '../../../services/product.service';
import { TypeService, Type } from '../../../services/type.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard-shop.component.html',
  styleUrl: './dashboard-shop.component.css'
})
export class DashboardShopComponent implements OnInit {
  shop: Shop | null = null;
  products: Product[] = [];
  types: Type[] = [];
  loadingShop = true;
  loadingProducts = true;
  loadingTypes = true;
  errorMessage = '';

  // Formulaire d'ajout
  newProduct: Partial<Product> = { name: '', description: '', id_type: '' };

  // Édition inline
  editingProductId: string | null = null;
  editingProduct: Partial<Product> = { name: '', description: '', id_type: '' };

  constructor(
    private shopService: ShopService,
    private productService: ProductService,
    private typeService: TypeService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMyShop();
    this.loadTypes();
  }

  private loadMyShop(): void {
    const user = this.authService.currentUser;
    if (!user || !user.id_shop) {
      this.errorMessage = 'Aucune boutique associée à votre compte.';
      this.loadingShop = false;
      return;
    }

    this.shopService.getShopById(user.id_shop).subscribe({
      next: (shop) => {
        this.shop = shop;
        this.loadingShop = false;
        this.loadProducts(shop._id);
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger votre boutique';
        this.loadingShop = false;
      }
    });
  }

  private loadProducts(shopId: string): void {
    this.productService.getProductsByShop(shopId).subscribe({
      next: (products) => {
        this.products = products;
        this.loadingProducts = false;
      },
      error: (err) => {
        console.error('Erreur chargement produits', err);
        this.loadingProducts = false;
      }
    });
  }

  private loadTypes(): void {
    this.typeService.getAllTypes().subscribe({
      next: (types) => {
        this.types = types;
        this.loadingTypes = false;
      },
      error: (err) => {
        console.error('Erreur chargement types', err);
        this.errorMessage = 'Impossible de charger les types de produits';
        this.loadingTypes = false;
      }
    });
  }

  // AJOUTER un produit
  addProduct() {
    if (!this.shop || !this.newProduct.name || !this.newProduct.id_type) return;

    const payload = {
      name: this.newProduct.name,
      description: this.newProduct.description || '',
      id_type: this.newProduct.id_type,
      id_shop: this.shop._id
    };

    this.productService.createProduct(payload).subscribe({
      next: (newProduct) => {
        this.products.push(newProduct);
        this.newProduct = { name: '', description: '', id_type: '' };
      },
      error: (err) => {
        this.errorMessage = 'Erreur création produit';
        console.error(err);
      }
    });
  }

  // COMMENCER édition
  startEdit(product: Product) {
    this.editingProductId = product._id;
    this.editingProduct = {
      name: product.name,
      description: product.description || '',
      id_type: product.id_type?._id || product.id_type || '' // récupère l'ID brut
    };
  }

  // ENREGISTRER édition
  saveEdit() {
    if (!this.editingProductId || !this.editingProduct.name || !this.editingProduct.id_type) return;

    this.productService.updateProduct(this.editingProductId, this.editingProduct).subscribe({
      next: (updated) => {
        const index = this.products.findIndex(p => p._id === this.editingProductId);
        if (index !== -1) this.products[index] = updated;
        this.cancelEdit();
      },
      error: (err) => {
        this.errorMessage = 'Erreur mise à jour produit';
        console.error(err);
      }
    });
  }

  cancelEdit() {
    this.editingProductId = null;
    this.editingProduct = { name: '', description: '', id_type: '' };
  }

  deleteProduct(id: string) {
    if (!confirm('Confirmer la suppression ?')) return;

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p._id !== id);
      },
      error: (err) => {
        this.errorMessage = 'Erreur suppression produit';
        console.error(err);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}