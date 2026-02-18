import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BoutiqueService, Boutique } from '../../../services/boutique.service';
import { ProductService, Product } from '../../../services/product.service';

@Component({
  selector: 'app-boutiques-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './boutiques-details.component.html',
  styleUrl: './boutiques-details.component.css'
})
export class BoutiqueDetailsComponent implements OnInit {
  boutique: Boutique | null = null;
  products: Product[] = [];
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private boutiqueService: BoutiqueService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const boutiqueId = this.route.snapshot.paramMap.get('id');
    if (!boutiqueId) {
      this.error = 'ID boutique manquant';
      this.loading = false;
      return;
    }

    this.boutiqueService.getBoutiqueById(boutiqueId).subscribe({
      next: (boutique: Boutique) => {
        this.boutique = boutique;
        this.loading = false;

        if (boutique.id_shop?._id) {
          this.productService.getProductsByShop(boutique.id_shop._id).subscribe({
            next: (prods: Product[]) => this.products = prods,
            error: () => {}
          });
        }
      },
      error: (err: any) => {
        this.error = 'Impossible de charger la boutique';
        this.loading = false;
        console.error(err);
      }
    });
  }
}