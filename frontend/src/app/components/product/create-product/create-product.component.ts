import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../services/product.service';
import { TypeService, Type } from '../../../services/type.service';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-product.component.html',
  styleUrl: './create-product.component.css'
})
export class CreateProductComponent {
  @Input() shopId!: string;
  @Output() productCreated = new EventEmitter<Product>();
  @Output() cancel = new EventEmitter<void>();

  types: Type[] = [];
  product: Partial<Product> = { name: '', description: '', id_type: '' };
  error = '';

  constructor(
    private productService: ProductService,
    private typeService: TypeService
  ) {
    this.loadTypes();
  }

  private loadTypes() {
    this.typeService.getAllTypes().subscribe({
      next: (types) => this.types = types,
      error: (err) => console.error('Erreur types', err)
    });
  }

  submit() {
    if (!this.product.name || !this.product.id_type) {
      this.error = 'Nom et type obligatoires';
      return;
    }

    const payload = {
      name: this.product.name,
      description: this.product.description || '',
      id_type: this.product.id_type,
      id_shop: this.shopId
    };

    this.productService.createProduct(payload).subscribe({
      next: (newProduct) => {
        this.productCreated.emit(newProduct);
        this.resetForm();
      },
      error: (err) => this.error = 'Erreur création'
    });
  }

  resetForm() {
    this.product = { name: '', description: '', id_type: '' };
    this.error = '';
  }

  cancelForm() {
    this.cancel.emit();
  }
}