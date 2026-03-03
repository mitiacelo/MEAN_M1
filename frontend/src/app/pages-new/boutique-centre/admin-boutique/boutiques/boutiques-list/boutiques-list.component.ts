import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BoutiqueService, Boutique } from '../../../../../services/boutique.service';

@Component({
  selector: 'app-boutiques-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './boutiques-list.component.html',
  styleUrls: ['./boutiques-list.component.css']
})
export class BoutiquesListComponent implements OnInit {
  @Input() boutiques: Boutique[] = [];
  loading = true;
  error = '';

  constructor(private boutiqueService: BoutiqueService) {}

  ngOnInit(): void {
    this.boutiqueService.getAllBoutiques().subscribe({
      next: (boutiques: Boutique[]) => {
        // Ajouter un fallback image si imageUrl manquant
        this.boutiques = boutiques.map(b => ({
          ...b,
          imageUrl: b.imageUrl || '/assets/default-boutique.jpg'
        }));
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Impossible de charger les boutiques';
        this.loading = false;
        console.error('Erreur chargement boutiques :', err);
      }
    });
  }
}