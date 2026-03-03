import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { CentreService, Centre } from '../../../services/centre.service';
import { SalleComponent } from '../../boutique-centre/admin-boutique/salle/salle.component';
import { BoutiquesListComponent } from '../../boutique-centre/admin-boutique/boutiques/boutiques-list/boutiques-list.component';
import { HeaderComponent } from '../../../components-new/layouts/header/header.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule, SalleComponent, BoutiquesListComponent, HeaderComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  centre: Centre | null = null;

  constructor(
    public authService: AuthService,
    private centreService: CentreService
  ) {}

  ngOnInit(): void {
    const cached = this.centreService.currentCentre;
    if (cached) {
      this.centre = cached;
    } else {
      this.centreService.getCentre().subscribe({
        next: c  => this.centre = c,
        error: () => {}
      });
    }
  }
}