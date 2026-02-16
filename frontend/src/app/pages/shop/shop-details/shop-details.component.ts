import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ShopService, Shop } from '../../../services/shop.service';
import { ProductService, Product } from '../../../services/product.service';

@Component({
  selector: 'app-shop-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shop-details.component.html',
  styleUrl: './shop-details.component.css'
})
export class ShopDetailsComponent implements OnInit {
  shop: Shop | null = null;
  products: Product[] = [];
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private shopService: ShopService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    const shopId = this.route.snapshot.paramMap.get('id');
    if (!shopId) {
      this.error = 'ID de boutique manquant';
      this.loading = false;
      return;
    }

    // Charger la boutique
    this.shopService.getShopById(shopId).subscribe({
      next: (shop) => {
        this.shop = shop;
      },
      error: (err) => {
        this.error = 'Impossible de charger la boutique';
        console.error(err);
      }
    });

    // Charger les produits de cette boutique
    this.productService.getProductsByShop(shopId).subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Impossible de charger les produits';
        this.loading = false;
        console.error(err);
      }
    });
  }
}