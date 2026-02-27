import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../../../services/product.service';
import { TypeService, Type } from '../../../../../services/type.service';

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
  @Input() boutiqueId!: string;  // ← Changé : boutiqueId au lieu de shopId
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
      error: (err) => console.error('Erreur chargement types', err)
    });
  }

  submit() {
    if (!this.product.name || !this.product.id_type || this.product.quantite == null || this.product.prix == null) {
      this.error = 'Tous les champs obligatoires doivent être remplis';
      return;
    }

    if (!this.boutiqueId) {
      this.error = 'Aucune boutique sélectionnée';
      return;
    }

    const payload = {
      name: this.product.name,
      description: this.product.description || '',
      id_type: this.product.id_type,
      id_category: this.product.id_category || null, // ou supprime si non utilisé
      id_boutique: this.boutiqueId,  // ← CHANGEMENT IMPORTANT
      quantite: Number(this.product.quantite),
      prix: Number(this.product.prix)
    };

    console.log('Payload envoyé au backend :', payload);

    this.productService.createProduct(payload).subscribe({
      next: (newProduct) => {
        console.log('Produit créé avec succès :', newProduct);
        this.productCreated.emit(newProduct);
        this.resetForm();
      },
      error: (err) => {
        console.error('Erreur création produit :', err);
        this.error = err.error?.message || 'Erreur lors de la création du produit';
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