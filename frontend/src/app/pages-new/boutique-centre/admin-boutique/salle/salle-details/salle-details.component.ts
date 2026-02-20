import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { ShopService, Shop } from '../../../../../services/shop.service';
import { ProductService, Product } from '../../../../../services/product.service';
import { NotificationService } from '../../../../../services/notification.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-salle-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './salle-details.component.html',
  styleUrl: './salle-details.component.css'
})
export class SalleDetailsComponent implements OnInit {
  shop: Shop | null = null;
  products: Product[] = [];
  loading = true;
  error = '';
  requestSent = false;
  hasRequested = false;

  visitForm = {
    phone: '',
    email: '',
    message: ''
  };

  constructor(
    private route: ActivatedRoute,
    private shopService: ShopService,
    private productService: ProductService,
    private notificationService: NotificationService,
    private http: HttpClient,
    public authService: AuthService
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

        if (shop.status === 'actif') {
          this.loadProducts(shopId);
        }

        this.visitForm.email = this.authService.currentUser?.email || '';

        this.checkIfAlreadyRequested(shopId);
      },
      error: (err) => {
        this.error = 'Impossible de charger la boutique';
        this.loading = false;
        console.error(err);
      }
    });
  }

  private checkIfAlreadyRequested(shopId: string) {
    const userId = this.authService.currentUser?.id;
    if (!userId) return;

    this.notificationService.checkIfRequestExists(userId, shopId).subscribe({
      next: (exists) => {
        this.hasRequested = exists;
      },
      error: (err) => console.error('Erreur vérification demande existante', err)
    });
  }

  private loadProducts(shopId: string) {
    this.productService.getProductsByShop(shopId).subscribe({
      next: (products) => this.products = products,
      error: (err) => console.error('Erreur chargement produits', err)
    });
  }

  submitVisitRequest() {
    if (!this.shop || !this.visitForm.phone || !this.visitForm.email || !this.visitForm.message) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    const payload = {
      user: this.authService.currentUser?.id,
      shop: this.shop._id,
      phone: this.visitForm.phone,
      email: this.visitForm.email,
      message: this.visitForm.message
    };

    this.http.post(`${environment.apiUrl}/notifications`, payload).subscribe({
      next: () => {
        this.requestSent = true;
        this.hasRequested = true;
        this.error = '';
      },
      error: (err) => {
        this.error = 'Erreur lors de l\'envoi de la demande';
        console.error(err);
      }
    });
  }
}