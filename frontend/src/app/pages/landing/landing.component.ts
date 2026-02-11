import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ShopService, Shop } from '../../services/shop.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  availableShops: Shop[] = [];
  activeShops: Shop[] = [];
  loading = true;

  constructor(
    public authService: AuthService,
    private shopService: ShopService
  ) {}

  ngOnInit() {
    this.loadShops();
  }

  loadShops() {
    this.shopService.getAvailableShops().subscribe({
      next: (shops) => {
        this.availableShops = shops;
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.shopService.getActiveShops().subscribe({
      next: (shops) => this.activeShops = shops
    });
  }
}