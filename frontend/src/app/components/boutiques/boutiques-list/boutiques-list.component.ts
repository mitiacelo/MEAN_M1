import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BoutiqueService, Boutique } from '../../../services/boutique.service';

@Component({
  selector: 'app-boutiques-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './boutiques-list.component.html',
  styleUrl: './boutiques-list.component.css'
})
export class BoutiquesListComponent implements OnInit {
  boutiques: Boutique[] = [];
  loading = true;
  error = '';

  constructor(private boutiqueService: BoutiqueService) {}

  ngOnInit(): void {
    this.boutiqueService.getAllBoutiques().subscribe({
      next: (boutiques: Boutique[]) => {
        this.boutiques = boutiques;
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