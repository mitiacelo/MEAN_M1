import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseService } from '../../../../services/purchase.service';
import { CartService } from '../../../../services/cart.service';
import { Purchase } from '../../../../services/purchase.service';
import { Cart, CartItem } from '../../../../services/cart.service';

interface ClientSummary {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  lastPurchase: string;
}

interface CartSummary {
  id: string;
  user: { name: string };
  itemCount: number;
  total: number;
  status: 'active' | 'abandoned' | 'ordered';
  updatedAt: string;
}

interface OrderSummary {
  id: string;
  user: { name: string };
  total: number;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-suivi-donnees',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suivi-donnees.component.html',
  styleUrl: './suivi-donnees.component.css'
})
export class SuiviDonneesComponent implements OnInit {
  clients: ClientSummary[] = [];
  carts: CartSummary[] = [];
  orders: OrderSummary[] = [];
  stats = { totalSales: 0, activeClients: 0, pendingOrders: 0 };

  loading = true;
  error: string | null = null;

  constructor(
    private purchaseService: PurchaseService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;

    // 1. Achats / commandes
    this.purchaseService.getPurchases().subscribe({
      next: (purchases: Purchase[]) => {
        this.orders = purchases.map(p => {
          let userName = 'N/A';

          if (typeof p.user === 'string') {
            userName = 'Client ' + (p.user as string).slice(0, 8);
          } else if (p.user && typeof p.user === 'object') {
            userName = p.user.name || 'N/A';
          }

          return {
            id: p._id,
            user: { name: userName },
            total: p.grandTotal,
            status: p.status,
            createdAt: p.createdAt
          };
        });

        this.stats.totalSales = purchases.reduce((sum: number, p: Purchase) => sum + p.grandTotal, 0);
        this.stats.pendingOrders = purchases.filter((p: Purchase) => 
          p.status === 'pending' || p.status === 'confirmed'
        ).length;

        // Clients uniques
        const uniqueUsers = new Map<string, ClientSummary>();
        purchases.forEach((p: Purchase) => {
          const userId = typeof p.user === 'string' ? p.user : p.user?.id || 'unknown';
          let userName = 'N/A';

          if (typeof p.user === 'string') {
            userName = 'Client ' + (p.user as string).slice(0, 8);
          } else if (p.user && typeof p.user === 'object') {
            userName = p.user.name || 'N/A';
          }

          if (!uniqueUsers.has(userId)) {
            uniqueUsers.set(userId, {
              id: userId,
              name: userName,
              email: typeof p.user === 'string' ? 'N/A' : (p.user?.email || 'N/A'),
              totalSpent: 0,
              lastPurchase: p.createdAt
            });
          }
          const client = uniqueUsers.get(userId)!;
          client.totalSpent += p.grandTotal;
          if (new Date(p.createdAt) > new Date(client.lastPurchase)) {
            client.lastPurchase = p.createdAt;
          }
        });

        this.clients = Array.from(uniqueUsers.values());
        this.stats.activeClients = this.clients.length;
      },
      error: (err: any) => {
        this.error = 'Erreur chargement achats';
        console.error(err);
      }
    });

    // 2. Paniers
    this.cartService.getAllCarts().subscribe({
      next: (carts: Cart[]) => {
        this.carts = carts.map(c => {
          let userName = 'Anonyme';

          if (typeof c.user === 'string') {
            userName = 'Client ' + (c.user as string).slice(0, 8);
          } else if (c.user && typeof c.user === 'object') {
            userName = (c.user as any).name || 'Anonyme';
          }

          return {
            id: c._id,
            user: { name: userName },
            itemCount: c.items.length,
            total: c.items.reduce((sum: number, i: CartItem) => sum + (i.priceAtAddition || 0) * i.quantity, 0),
            status: c.items.length > 0 ? 'active' : 'abandoned',
            updatedAt: (c as any).updatedAt || new Date().toISOString()
          };
        });
      },
      error: (err: any) => {
        this.error = 'Erreur chargement paniers';
        console.error(err);
      }
    });

    this.loading = false;
  }
}