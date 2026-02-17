import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ShopService, Shop } from '../../../services/shop.service';
import { ProductService, Product } from '../../../services/product.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { RegisterPopupComponent } from '../../../auth/register/register-popup/register-popup.component';
@Component({
  selector: 'app-shop-details',
  standalone: true,
  imports: [CommonModule, 
    RouterLink,
    RegisterPopupComponent],
  templateUrl: './shop-details.component.html',
  styleUrl: './shop-details.component.css'
})
export class ShopDetailsComponent implements OnInit {
  shop: Shop | null = null;
  products: Product[] = [];
  loading = true;
  error = '';
  requestSent = false;
  isUpdating = false;
  showRegisterPopup = false;

  constructor(
    private route: ActivatedRoute,
    private shopService: ShopService,
    private productService: ProductService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const shopId = this.route.snapshot.paramMap.get('id');
    if (!shopId) {
      this.error = 'ID de boutique manquant';
      this.loading = false;
      return;
    }

    this.loadShop(shopId);
  }

  private loadShop(shopId: string) {
    this.shopService.getShopById(shopId).subscribe({
      next: (shop) => {
        this.shop = shop;
        this.loading = false;

        // Charger les produits UNIQUEMENT si actif
        if (shop.status === 'actif') {
          this.loadProducts(shopId);
        }
      },
      error: (err) => {
        this.error = 'Impossible de charger la boutique';
        this.loading = false;
        console.error(err);
      }
    });
  }

  private loadProducts(shopId: string) {
    this.productService.getProductsByShop(shopId).subscribe({
      next: (products) => this.products = products,
      error: (err) => console.error('Erreur chargement produits', err)
    });
  }

  openRegisterPopup() {
    this.showRegisterPopup = true;
  }

  onRegisterSuccess(user: any) {
    // L'utilisateur est inscrit et connecté automatiquement
    // On met à jour la boutique avec id_user = nouvel utilisateur
    if (this.shop) {
      this.http.patch(`${environment.apiUrl}/shops/${this.shop._id}`, {
        id_user: user.id,       // ou user._id selon ce que renvoie ton API
        status: 'en attente'
      }).subscribe({
        next: (updatedShop: any) => {
          this.shop = { ...this.shop, ...updatedShop } as Shop;
          this.requestSent = true;
        },
        error: (err) => {
          console.error('Erreur attribution propriétaire', err);
          this.error = 'Inscription réussie mais erreur lors de l\'attribution';
        }
      });
    }
    this.showRegisterPopup = false;
  }

  closePopup() {
    this.showRegisterPopup = false;
  }

  requestVisit() {
    if (!this.shop || this.isUpdating || this.requestSent) return;

    this.isUpdating = true;

    this.http.patch(`${environment.apiUrl}/shops/${this.shop._id}`, {
      status: 'en attente'
    }).subscribe({
      next: (updatedShop: any) => {
        this.shop = { ...this.shop, status: updatedShop.status } as Shop;
        this.requestSent = true;
        this.isUpdating = false;
      },
      error: (err) => {
        console.error('Erreur mise à jour statut boutique', err);
        this.error = 'Impossible d’envoyer la demande de visite';
        this.isUpdating = false;
      }
    });
  }
}