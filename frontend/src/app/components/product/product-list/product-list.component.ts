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
  editingProduct: Partial<Product> = { name: '', description: '', id_type: '' };

  constructor(
    private productService: ProductService,
    private typeService: TypeService
  ) {}

  startEdit(product: Product) {
    this.editingProductId = product._id;
    this.editingProduct = {
      name: product.name,
      description: product.description || '',
      id_type: product.id_type?._id || product.id_type || ''
    };
  }

  saveEdit() {
    if (!this.editingProductId || !this.editingProduct.name || !this.editingProduct.id_type) return;

    this.productService.updateProduct(this.editingProductId, this.editingProduct).subscribe({
      next: (updated) => {
        this.productUpdated.emit(updated);
        this.cancelEdit();
      },
      error: (err) => console.error('Erreur update', err)
    });
  }

  cancelEdit() {
    this.editingProductId = null;
    this.editingProduct = { name: '', description: '', id_type: '' };
  }

  deleteProduct(id: string) {
    if (!confirm('Confirmer ?')) return;

    this.productService.deleteProduct(id).subscribe({
      next: () => this.productDeleted.emit(id),
      error: (err) => console.error('Erreur delete', err)
    });
  }
}