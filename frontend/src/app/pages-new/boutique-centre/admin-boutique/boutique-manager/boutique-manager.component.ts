import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { BoutiqueService, Boutique } from '../../../../services/boutique.service';
import { ProductService, Product } from '../../../../services/product.service';
import { TypeService, Type } from '../../../../services/type.service';
import { DomaineService, Domaine } from '../../../../services/domaine.service';
import { ShopService, Shop } from '../../../../services/shop.service';
import { AuthService } from '../../../../services/auth.service';
import { CreateProductComponent } from '../../../boutique-centre/admin-boutique/product/create-product/create-product.component';
import { ProductListComponent } from '../../../boutique-centre/admin-boutique/product/product-list/product-list.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-boutique-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CreateProductComponent,
    ProductListComponent
  ],
  templateUrl: './boutique-manager.component.html',
  styleUrls: ['./boutique-manager.component.css']
})
export class BoutiqueManagerComponent implements OnInit {
  selectedBoutique: Boutique | null = null;
  selectedShop: Shop | null = null;
  products: (Product & { mainImage: string })[] = [];
  types: Type[] = [];
  domaines: Domaine[] = [];
  loading = true;
  errorMessage = '';

  showCreateProductForm = false;
  importLoading = false;
  importError: string = '';
  importSuccess: string = '';

  environment = environment; // pour accès direct dans le template

  constructor(
    private route: ActivatedRoute,
    private boutiqueService: BoutiqueService,
    private productService: ProductService,
    private typeService: TypeService,
    private domaineService: DomaineService,
    private shopService: ShopService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    // Charger types et domaines
    this.typeService.getAllTypes().subscribe(t => this.types = t);
    this.domaineService.getAllDomaines().subscribe(d => this.domaines = d);

    // Charger la boutique via l'ID dans l'URL
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const boutiqueId = params.get('id');
        if (!boutiqueId) {
          this.errorMessage = 'Aucune boutique spécifiée';
          this.loading = false;
          return [];
        }
        this.loading = true;
        return this.boutiqueService.getBoutiqueById(boutiqueId);
      })
    ).subscribe({
      next: (boutique: Boutique | null) => {
        if (boutique) {
          this.selectedBoutique = boutique;

          // Charger la salle associée
          if (boutique.id_shop?._id) {
            this.shopService.getShopById(boutique.id_shop._id).subscribe({
              next: shop => this.selectedShop = shop,
              error: () => this.selectedShop = null
            });
          }

          // Charger produits et préparer mainImage
          this.loadProducts(boutique._id);
        } else {
          this.errorMessage = 'Boutique non trouvée';
          this.loading = false;
        }
      },
      error: () => {
        this.errorMessage = 'Erreur chargement boutique';
        this.loading = false;
      }
    });
  }

  private loadProducts(boutiqueId: string): void {
    this.productService.getProductsByBoutique(boutiqueId).subscribe({
      next: prods => {
        this.products = prods.map(p => ({
          ...p,
          mainImage: p.images?.[0] ? `${environment.apiUrl}${p.images[0]}` : ''
        }));
        this.loading = false;
      },
      error: err => {
        console.error('Erreur produits :', err);
        this.products = [];
        this.loading = false;
      }
    });
  }

  onProductCreated(product: Product): void {
    this.products.push({
      ...product,
      mainImage: product.images?.[0] ? `${environment.apiUrl}${product.images[0]}` : ''
    });
    this.showCreateProductForm = false;
  }

  onProductUpdated(updated: Product): void {
    const index = this.products.findIndex(p => p._id === updated._id);
    if (index !== -1) {
      this.products[index] = {
        ...updated,
        mainImage: updated.images?.[0] ? `${environment.apiUrl}${updated.images[0]}` : ''
      };
    }
  }

  onProductDeleted(id: string): void {
    this.products = this.products.filter(p => p._id !== id);
  }

  onFileSelected(event: Event): void {
    // Implémentation de l'import CSV / XLSX
  }
}