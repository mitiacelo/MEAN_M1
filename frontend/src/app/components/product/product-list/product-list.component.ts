import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../services/product.service';
import { TypeService, Type } from '../../../services/type.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {
  @Input() products: Product[] = [];
  @Input() types: Type[] = [];
  @Output() productUpdated = new EventEmitter<Product>();
  @Output() productDeleted = new EventEmitter<string>();

  editingProductId: string | null = null;
  editingProduct: Partial<Product> = {};

  constructor(
    private productService: ProductService,
    private typeService: TypeService
  ) {}

  startEdit(product: Product) {
    this.editingProductId = product._id;
    this.editingProduct = {
      name: product.name,
      description: product.description || '',
      id_type: product.id_type?._id || product.id_type || '',
      quantite: product.quantite || 0,
      prix_actuel: product.prix_actuel || 0
    };
  }

  saveEdit() {
    if (!this.editingProductId || !this.editingProduct.name || !this.editingProduct.id_type) {
      console.warn('Champs obligatoires manquants');
      return;
    }

    const payload = {
      name: this.editingProduct.name,
      description: this.editingProduct.description || '',
      id_type: this.editingProduct.id_type,
      quantite: Number(this.editingProduct.quantite),
      prix: Number(this.editingProduct.prix_actuel)  // ← mise à jour du prix actuel (optionnel)
    };

    this.productService.updateProduct(this.editingProductId, payload).subscribe({
      next: (updated: Product) => {
        const index = this.products.findIndex(p => p._id === updated._id);
        if (index !== -1) {
          this.products[index] = updated;
        }
        this.productUpdated.emit(updated);
        this.cancelEdit();
      },
      error: (err) => {
        console.error('Erreur mise à jour produit :', err);
      }
    });
  }

  cancelEdit() {
    this.editingProductId = null;
    this.editingProduct = {};
  }

  deleteProduct(id: string) {
    if (!confirm('Vraiment supprimer ce produit ?')) return;

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p._id !== id);
        this.productDeleted.emit(id);
      },
      error: (err) => {
        console.error('Erreur suppression produit :', err);
      }
    });
  }
}