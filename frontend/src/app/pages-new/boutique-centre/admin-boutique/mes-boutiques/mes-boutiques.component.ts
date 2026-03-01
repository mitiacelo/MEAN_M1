import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BoutiqueService, Boutique } from '../../../../services/boutique.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-mes-boutiques',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mes-boutiques.component.html',
  styleUrls: ['./mes-boutiques.component.css']
})
export class MesBoutiquesComponent implements OnInit {
  boutiques: Boutique[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private boutiqueService: BoutiqueService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (!user?.id) {
      this.errorMessage = 'Utilisateur non connecté';
      this.loading = false;
      return;
    }

    // Charge toutes les boutiques du user
    this.boutiqueService.getMyBoutiques(user.id).subscribe({
      next: (boutiques) => {
        this.boutiques = boutiques;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur chargement boutiques';
        this.loading = false;
      }
    });
  }
}