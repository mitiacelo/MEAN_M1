import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ShopComponent } from '../shop/shop.component';
import { BoutiquesListComponent } from '../../components/boutiques/boutiques-list/boutiques-list.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ShopComponent,
    BoutiquesListComponent
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  constructor(public authService: AuthService) {}
}