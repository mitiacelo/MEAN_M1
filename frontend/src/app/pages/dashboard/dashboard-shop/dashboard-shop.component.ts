import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ShopService, Shop } from '../../../services/shop.service';
import { ProductService, Product } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard-shop',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-shop.component.html',
  styleUrl: './dashboard-shop.component.css'
})
export class DashboardShopComponent implements OnInit {
  shop: Shop | null = null;
  products: Product[] = [];
  loadingShop = true;
  loadingProducts = true;
  errorMessage = '';

  constructor(
    private shopService: ShopService,
    private productService: ProductService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMyShop();
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
        console.error('Erreur chargement boutique', err);
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
        this.errorMessage = this.errorMessage || 'Impossible de charger vos produits';
        this.loadingProducts = false;
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}