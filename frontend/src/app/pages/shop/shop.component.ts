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
  availableShops: Shop[] = [];   // statut "inactif" → en attente
  activeShops: Shop[] = [];      // statut "actif" → ouvertes
  loading = true;
  errorMessage = '';

  constructor(private shopService: ShopService) {}

  ngOnInit(): void {
    this.loadShops();
  }

  private loadShops(): void {
    // Chargement boutiques disponibles (inactif)
    this.shopService.getAvailableShops().subscribe({
      next: (shops) => {
        this.availableShops = shops;
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Erreur chargement boutiques disponibles', err);
        this.errorMessage = 'Impossible de charger les boutiques disponibles';
        this.checkLoadingComplete();
      }
    });

    // Chargement boutiques actives
    this.shopService.getActiveShops().subscribe({
      next: (shops) => {
        this.activeShops = shops;
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Erreur chargement boutiques actives', err);
        this.errorMessage = 'Impossible de charger les boutiques ouvertes';
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete(): void {
    // Arrête le loading quand les deux appels ont répondu (ou échoué)
    if (
      (this.availableShops.length >= 0 || this.errorMessage) &&
      (this.activeShops.length >= 0 || this.errorMessage)
    ) {
      this.loading = false;
    }
  }
}