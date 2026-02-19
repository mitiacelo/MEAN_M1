import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../services/product.service';
import { TypeService, Type } from '../../../services/type.service';

// Interface dédiée au formulaire (quantite et prix obligatoires)
interface ProductForm {
  name: string;
  description?: string;
  id_type: string;
  id_category?: string;
  quantite: number;
  prix: number;
}

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
  product: ProductForm = {
    name: '',
    description: '',
    id_type: '',
    id_category: '',
    quantite: 0,
    prix: 0
  };
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
    if (!this.product.name || !this.product.id_type || this.product.quantite == null || this.product.prix == null) {
      this.error = 'Tous les champs obligatoires doivent être remplis';
      return;
    }

    const payload = {
      name: this.product.name,
      description: this.product.description || '',
      id_type: this.product.id_type,
      id_category: this.product.id_category || 'default_category_id', // adapte selon ton cas
      id_shop: this.shopId,
      quantite: Number(this.product.quantite),
      prix: Number(this.product.prix)
    };

    this.productService.createProduct(payload).subscribe({
      next: (newProduct) => {
        this.productCreated.emit(newProduct);
        this.resetForm();
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur création produit';
        console.error(err);
      }
    });
  }

  resetForm() {
    this.product = {
      name: '',
      description: '',
      id_type: '',
      id_category: '',
      quantite: 0,
      prix: 0
    };
    this.error = '';
  }

  cancelForm() {
    this.cancel.emit();
  }
}