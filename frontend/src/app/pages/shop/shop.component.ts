import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ShopService, Shop } from '../../services/shop.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {
  availableShops: Shop[] = [];
  activeShops: Shop[] = [];
  loading = true;
  errorMessage = '';

  showLoginMessage = false;
  selectedShopId: string | null = null;

  constructor(
    private shopService: ShopService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadShops();
  }

  private loadShops(): void {
    this.shopService.getAvailableShops().subscribe({
      next: (shops) => {
        this.availableShops = shops;
        this.checkLoadingComplete();
      },
      error: (err) => {
        this.errorMessage = 'Erreur chargement boutiques disponibles';
        this.checkLoadingComplete();
      }
    });

    this.shopService.getActiveShops().subscribe({
      next: (shops) => {
        this.activeShops = shops;
        this.checkLoadingComplete();
      },
      error: (err) => {
        this.errorMessage = 'Erreur chargement boutiques actives';
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete(): void {
    if (this.availableShops.length >= 0 && this.activeShops.length >= 0) {
      this.loading = false;
    }
  }

  visitShop(shopId: string) {
    if (!this.authService.isLoggedIn) {
      this.selectedShopId = shopId;
      this.showLoginMessage = true;
    }
  }

  dismissMessage() {
    this.showLoginMessage = false;
    this.selectedShopId = null;
  }
}