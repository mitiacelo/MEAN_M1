import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router,RouterLink } from '@angular/router';
import { OrderService } from '../../../../services/order.service';
import { AuthService } from '../../../../services/auth.service';
import { HeaderComponent } from '../../../../components-new/layouts/header/header.component';

export interface OrderItem {
  product: {
    _id: string;
    name: string;
    prix_actuel?: number;
  };
  quantity: number;
  priceAtPurchase: number;
}

export interface Order {
  _id: string;
  cart: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink,HeaderComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn) {
      this.error = 'Vous devez être connecté pour voir vos commandes';
      this.loading = false;
      return;
    }

    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur chargement des commandes : ' + (err.error?.message || 'Erreur inconnue');
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const classes = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return classes[status as keyof typeof classes] || '';
  }

  finalizeOrder(orderId: string, totalPrice: number) {
    this.router.navigate(['/order-confirm', orderId], {
      state: { totalPrice }
    });
  }
  
  cancelOrder(orderId: string) {
    if (!confirm('Confirmer l\'annulation de la commande ?')) return;
  
    this.orderService.cancelOrder(orderId).subscribe({
      next: () => {
        alert('Commande annulée');
        this.loadOrders();
      },
      error: (err) => alert('Erreur : ' + (err.error?.message || 'Erreur'))
    });
  }
}