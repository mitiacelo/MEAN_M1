import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../../services/cart.service';
import { FavoriteService, Favorite } from '../../../../services/favorite.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  favorites: Favorite[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private favoriteService: FavoriteService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn) {
      this.error = 'Vous devez être connecté pour voir vos favoris';
      this.loading = false;
      return;
    }

    this.loadFavorites();
  }

  loadFavorites() {
    this.favoriteService.getFavorites().subscribe({
      next: (favs) => {
        this.favorites = favs;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur chargement favoris : ' + (err.error?.message || 'Erreur inconnue');
        this.loading = false;
      }
    });
  }

  addToCart(productId: string, quantity: number = 1) {
    this.cartService.addToCart(productId, quantity).subscribe({
      next: () => {
        alert('Produit ajouté au panier !');
      },
      error: (err) => {
        alert('Erreur ajout au panier : ' + (err.error?.message || 'Erreur'));
      }
    });
  }

  removeFavorite(productId: string) {
    if (!confirm('Retirer ce produit des favoris ?')) return;

    this.favoriteService.removeFromFavorites(productId).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(f => f.product._id !== productId);
        alert('Produit retiré des favoris');
      },
      error: (err) => {
        alert('Erreur suppression : ' + (err.error?.message || 'Erreur'));
      }
    });
  }
}