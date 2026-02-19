import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService, Cart, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn) {
      this.error = 'Vous devez être connecté pour voir votre panier';
      this.loading = false;
      return;
    }

    this.loadCart();
  }

  loadCart() {
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur chargement panier : ' + (err.error?.message || 'Erreur inconnue');
        this.loading = false;
      }
    });
  }

  updateQuantity(item: CartItem, change: number) {
    const newQuantity = item.quantity + change;
    if (newQuantity < 1) return;

    this.cartService.updateCartItem(item.product._id, newQuantity).subscribe({
      next: (updatedCart) => {
        this.cart = updatedCart;
      },
      error: (err) => {
        alert('Erreur mise à jour quantité : ' + (err.error?.message || 'Erreur'));
      }
    });
  }

  removeItem(productId: string) {
    if (!confirm('Supprimer cet article ?')) return;

    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
        this.loadCart(); // recharge le panier
      },
      error: (err) => {
        alert('Erreur suppression : ' + (err.error?.message || 'Erreur'));
      }
    });
  }

  get totalPrice(): number {
    if (!this.cart || !this.cart.items) return 0;
    return this.cart.items.reduce((sum, item) => {
      const price = item.priceAtAddition || item.product.prix_actuel || 0;
      return sum + price * item.quantity;
    }, 0);
  }

  get itemCount(): number {
    return this.cart?.items?.length || 0;
  }
}