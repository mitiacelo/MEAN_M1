import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CentreService } from '../../../services/centre.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  centreName = '';

  constructor(
    public authService: AuthService,
    private centreService: CentreService
  ) {}

  ngOnInit(): void {
    // Si déjà en cache → utilise la valeur immédiatement
    const cached = this.centreService.currentCentre;
    if (cached?.nom) {
      this.centreName = cached.nom;
      return;
    }
    // Sinon appel API
    this.centreService.getCentre().subscribe({
      next: c  => this.centreName = c.nom || '',
      error: () => this.centreName = ''
    });
  }
}