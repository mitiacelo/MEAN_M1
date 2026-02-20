import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { SalleComponent } from '../../boutique-centre/admin-boutique/salle/salle.component';
import { BoutiquesListComponent } from '../../boutique-centre/admin-boutique/boutiques/boutiques-list/boutiques-list.component';
import { HeaderComponent } from '../../../components-new/layouts/header/header.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    SalleComponent,
    BoutiquesListComponent,
    HeaderComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  constructor(public authService: AuthService) {}
}