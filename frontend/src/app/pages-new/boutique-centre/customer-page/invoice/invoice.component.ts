import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PurchaseService } from '../../../../services/purchase.service';
import { AuthService } from '../../../../services/auth.service';
import { Purchase, PurchaseItem } from '../../../../services/purchase.service';

// export interface PurchaseItem {
//   product: { _id: string; name: string; prix_actuel?: number };
//   quantity: number;
//   priceAtPurchase: number;
// }

// export interface Purchase {
//   _id: string;
//   user: { name: string; email: string; phone?: string };
//   items: PurchaseItem[];
//   totalProducts: number;
//   deliveryFee: number;
//   grandTotal: number;
//   deliveryAddress: { city: string; district: string; address: string; phone: string };
//   status: string;
//   createdAt: string;
// }

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css'
})
export class InvoiceComponent implements OnInit {
  purchase: Purchase | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private purchaseService: PurchaseService,
    public authService: AuthService  // ← CHANGE private → public
  ) {}

  ngOnInit() {
    const purchaseId = this.route.snapshot.paramMap.get('id');
    if (!purchaseId) {
      this.error = 'ID de facture manquant';
      this.loading = false;
      return;
    }

    this.purchaseService.getPurchase(purchaseId).subscribe({
      next: (purchase) => {
        this.purchase = purchase;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur chargement facture : ' + (err.error?.message || 'Erreur');
        this.loading = false;
      }
    });
  }

  get grandTotalDisplay(): number {
    return this.purchase?.grandTotal || 0;
  }

  printInvoice() {
    window.print();
  }
}