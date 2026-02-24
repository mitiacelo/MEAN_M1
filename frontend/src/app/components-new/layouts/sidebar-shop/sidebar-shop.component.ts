import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive,RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar-shop',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive,RouterOutlet],
  templateUrl: './sidebar-shop.component.html',
  styleUrls: ['./sidebar-shop.component.css']
})
export class SidebarShopComponent {
  constructor(public authService: AuthService) {}
}