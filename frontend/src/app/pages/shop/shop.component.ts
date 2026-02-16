import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ShopService, Shop } from '../../services/shop.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {
  shops: Shop[] = [];
  loading = true;
  errorMessage = '';

  constructor(private shopService: ShopService) {}

  ngOnInit(): void {
    this.loadAllShops();
  }

  private loadAllShops(): void {
    // On combine les deux appels (disponibles + actives)
    this.shopService.getAvailableShops().subscribe({
      next: (available) => {
        this.shops = [...available];
        this.shopService.getActiveShops().subscribe({
          next: (active) => {
            this.shops = [...this.shops, ...active];
            this.loading = false;
          },
          error: (err) => {
            this.errorMessage = 'Impossible de charger les boutiques ouvertes';
            this.loading = false;
            console.error(err);
          }
        });
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger les boutiques disponibles';
        this.loading = false;
        console.error(err);
      }
    });
  }
}