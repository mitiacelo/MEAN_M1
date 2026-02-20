import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BoutiqueService, Boutique } from '../../../../../services/boutique.service';
import { ProductService, Product } from '../../../../../services/product.service';
import { CartService } from '../../../../../services/cart.service';
import { AuthService } from '../../../../../services/auth.service';
import { HeaderComponent } from '../../../../../components-new/layouts/header/header.component';

@Component({
  selector: 'app-boutiques-details',
  standalone: true,
  imports: [CommonModule, RouterLink,HeaderComponent],
  templateUrl: './boutiques-details.component.html',
  styleUrl: './boutiques-details.component.css'
})
export class BoutiqueDetailsComponent implements OnInit {
  boutique: Boutique | null = null;
  products: Product[] = [];
  loading = true;
  showLoginMessageForCart = false;
  error = '';
  cartHasItems = false;

  constructor(
    private route: ActivatedRoute,
    private boutiqueService: BoutiqueService,
    private productService: ProductService,
    private cartService: CartService,
    public authService: AuthService
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

    if (this.authService.isLoggedIn) {
      this.cartService.getCart().subscribe({
        next: (cart) => {
          this.cartHasItems = cart.items.length > 0;
        }
      });
    }
  }

  addToCart(product: any) {
    if (product.quantite <= 0) {
      alert('Stock épuisé !');
      return;
    }

    this.cartService.addToCart(product._id, 1).subscribe({
      next: () => {
        alert(`${product.name} ajouté au panier !`);
        this.cartHasItems = true;  // ← on suppose qu'il y a au moins 1 article maintenant
      },
      error: (err) => {
        if (err.status === 401) {
          this.showLoginMessageForCart = true;
        } else {
          alert('Erreur : ' + (err.error?.message || 'Erreur inconnue'));
        }
      }
    });
  }
}