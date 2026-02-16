import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ShopComponent } from '../shop/shop.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ShopComponent   // ← on garde ça pour afficher <app-shop> dans le HTML
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  constructor(public authService: AuthService) {}
}