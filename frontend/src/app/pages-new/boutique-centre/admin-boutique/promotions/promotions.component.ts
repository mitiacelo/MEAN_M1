import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PromotionService } from '../../../../services/promotion.service';
import { ProductService, Product } from '../../../../services/product.service';
import { BoutiqueService } from '../../../../services/boutique.service';

interface Promotion {
  _id?: string;
  product: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  productData?: Product; // Populé pour l'affichage
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
  
  createPromotion() {
    this.promotionService.createProductPromotion(this.newPromotion).subscribe({
      next: (promo: Promotion) => {
        this.promotions.push(promo);
        this.success = 'Promotion créée avec succès !';
        this.error = '';
        this.newPromotion = { product: '', discountType: 'percentage', discountValue: 0, startDate: '', endDate: '' };
      },
      error: err => this.error = err.error?.message || 'Erreur création promotion'
    });
  }
}