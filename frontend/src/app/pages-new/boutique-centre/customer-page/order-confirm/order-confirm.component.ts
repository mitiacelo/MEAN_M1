import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../../services/order.service';
import { Order } from '../orders/orders.component';
@Component({
  selector: 'app-order-confirm',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-confirm.component.html'
})
export class OrderConfirmComponent implements OnInit {
  orderId: string = '';
  deliveryForm: FormGroup;
  loading = false;
  totalPrice: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private orderService: OrderService
  ) {
    this.deliveryForm = this.fb.group({
      city: ['', Validators.required],
      district: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });
  }

  order: Order | null = null;

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    this.loadOrder(); 
  
    // Récupération fiable du total via history.state
    const state = history.state || {};
    this.totalPrice = state.totalPrice || 0;
  
    console.log('Order ID:', this.orderId);
    console.log('TotalPrice récupéré:', this.totalPrice);
  
    // Fallback API si state vide
    if (this.totalPrice === 0 && this.orderId) {
      this.loadOrderTotal();
    }
  }
  
  loadOrderTotal() {
    this.orderService.getOrder(this.orderId).subscribe({
      next: (order: any) => {
        this.totalPrice = order.totalPrice || 0;
        console.log('Total chargé via API :', this.totalPrice);
      },
      error: (err) => {
        console.error('Erreur chargement total', err);
        this.totalPrice = 0;
      }
    });
  }

  loadOrder() {
    this.orderService.getOrder(this.orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.totalPrice = order.totalPrice || 0;
      },
      error: (err) => {
        console.error('Erreur chargement commande', err);
        this.totalPrice = 0;
      }
    });
  };
  submitDelivery() {
    console.log('Formulaire valide ?', this.deliveryForm.valid);
    console.log('Erreurs :', this.deliveryForm.errors);
    console.log('Valeurs :', this.deliveryForm.value);

    if (this.deliveryForm.invalid) {
      this.deliveryForm.markAllAsTouched(); // ← affiche les erreurs aux champs
      return;
    }
    if (this.deliveryForm.invalid) return;

    this.loading = true;

    this.orderService.finalizeOrder(this.orderId, this.deliveryForm.value).subscribe({
      next: (response) => {  // ← AJOUTE LE PARAMÈTRE (response) ici
        alert('Commande finalisée ! Vous recevrez bientôt une confirmation.');
        this.router.navigate(['/invoice', response.purchaseId]);  // ← maintenant response est défini
      },
      error: (err) => {
        alert('Erreur : ' + (err.error?.message || 'Erreur'));
        this.loading = false;
      }
    });
  }

}

