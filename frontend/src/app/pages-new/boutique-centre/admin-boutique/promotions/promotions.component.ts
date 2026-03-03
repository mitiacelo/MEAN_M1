import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PromotionService } from '../../../../services/promotion.service';
import { ProductService, Product } from '../../../../services/product.service';
import { BoutiqueService } from '../../../../services/boutique.service';

interface Promotion {
  _id?: string;
  product: string | Product;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;// Populé pour l'affichage
}

@Component({
  selector: 'app-promotions',
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.css'],
  imports: [CommonModule, FormsModule]
})
export class PromotionsComponent implements OnInit {
  boutiques: any[] = [];
  selectedBoutiqueId: string = '';
  products: Product[] = [];

  promotions: Promotion[] = [];

  newPromotion: Promotion = {
    product: '',
    discountType: 'percentage',
    discountValue: 0,
    startDate: '',
    endDate: ''
  };

  error: string = '';
  success: string = '';

  constructor(
    private promotionService: PromotionService,
    private productService: ProductService,
    private boutiqueService: BoutiqueService
  ) {}

  ngOnInit() {
    this.loadBoutiques();
    this.loadPromotions();
  }

  loadBoutiques() {
    this.boutiqueService.getAllBoutiques().subscribe({
      next: data => this.boutiques = data,
      error: err => console.error('Erreur récupération boutiques', err)
    });
  }

  onBoutiqueChange(boutiqueId: string) {
    this.selectedBoutiqueId = boutiqueId;
    this.loadProducts(boutiqueId);
    this.newPromotion.product = ''; // reset produit sélectionné
  }

  loadProducts(boutiqueId: string) {
    if (!boutiqueId) {
      this.products = [];
      return;
    }
    this.productService.getProductsByBoutique(boutiqueId).subscribe({
      next: data => this.products = data,
      error: err => console.error('Erreur récupération produits', err)
    });
  }

  loadPromotions() {
    this.promotionService.getAllPromotions().subscribe({
      next: (data: Promotion[]) => this.promotions = data,
      error: err => console.error('Erreur récupération promotions', err)
    });
  }

  getProductName(p: Promotion): string {
    if (!p.product) return 'Produit supprimé';
  
    if (typeof p.product === 'string') {
      return 'Produit supprimé';
    }
  
    return p.product.name || 'Produit supprimé';
  }
  
  createPromotion() {
    const payload = {
      ...this.newPromotion,
      product: typeof this.newPromotion.product === 'string'
        ? this.newPromotion.product
        : this.newPromotion.product._id
    };
  
    this.promotionService.createProductPromotion(payload).subscribe({
      next: (promo: Promotion) => {
        this.promotions.push(promo);
        this.success = 'Promotion créée avec succès !';
        this.error = '';
        this.newPromotion = {
          product: '',
          discountType: 'percentage',
          discountValue: 0,
          startDate: '',
          endDate: ''
        };
      },
      error: err => this.error = err.error?.message || 'Erreur création promotion'
    });
  }

  // Supprimer une promotion
  deletePromotion(promo: Promotion) {
    if (!promo._id) return console.error('ID promotion manquant');
  
    if (!confirm('Voulez-vous vraiment supprimer cette promotion ?')) return;
  
    this.promotionService.deletePromotion(promo._id).subscribe({
      next: () => {
        this.promotions = this.promotions.filter(p => p._id !== promo._id);
        this.success = 'Promotion supprimée avec succès !';
        this.error = '';
      },
      error: err => {
        console.error('Erreur suppression promotion', err);
        this.error = err.error?.message || 'Erreur suppression promotion';
      }
    });
  }

// Préparer la modification (remplir le formulaire)
editPromotion(promo: Promotion) {
  this.newPromotion = { ...promo }; // clone
}

// Confirmer la modification
updatePromotion() {
  if (!this.newPromotion._id) return;

  const payload = {
    ...this.newPromotion,
    product: typeof this.newPromotion.product === 'string'
      ? this.newPromotion.product
      : this.newPromotion.product._id
  };

  this.promotionService.updatePromotion(this.newPromotion._id, payload).subscribe({
    next: (updated) => {
      const index = this.promotions.findIndex(p => p._id === updated._id);
      if (index > -1) this.promotions[index] = updated;
      this.success = 'Promotion mise à jour avec succès !';
      this.error = '';
      this.newPromotion = {
        product: '',
        discountType: 'percentage',
        discountValue: 0,
        startDate: '',
        endDate: ''
      };
    },
    error: err => this.error = err.error?.message || 'Erreur mise à jour promotion'
  });
}
}