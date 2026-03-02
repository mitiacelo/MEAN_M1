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

  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  onFilesSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
    this.imagePreviews = [];

    for (let file of this.selectedFiles) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreviews.push(e.target.result);
      reader.readAsDataURL(file);
    }
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
  
    // Création du FormData
    const formData = new FormData();
    formData.append('name', this.product.name);
    formData.append('description', this.product.description || '');
    formData.append('id_type', this.product.id_type);
    formData.append('id_boutique', this.boutiqueId);
    formData.append('quantite', this.product.quantite.toString());
    formData.append('prix', this.product.prix.toString());
  
    // Ajout des fichiers images sélectionnés
    for (let file of this.selectedFiles) {
      formData.append('images', file);
    }
  
    // Envoi au backend via le service ProductService
    this.productService.createProduct(formData).subscribe({
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