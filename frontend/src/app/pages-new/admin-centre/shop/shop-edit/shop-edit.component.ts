import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { ShopService } from '../../../../services/shop.service';

@Component({
  selector: 'app-shop-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './shop-edit.component.html',
  styleUrl: './shop-edit.component.css'
})
export class ShopEditComponent implements OnInit {
  shop: any = null;
  users: any[] = [];
  loading = true;
  error = '';

  editNom: string = '';
  editSuperficie: number = 0;
  editDescription: string = '';
  editUserId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shopService: ShopService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const shopId = this.route.snapshot.paramMap.get('id');
    if (!shopId) {
      this.error = 'ID manquant';
      this.loading = false;
      return;
    }

    this.shopService.getShopById(shopId).subscribe({
      next: (shop) => {
        this.shop = shop;
        this.editNom = shop.name;
        this.editSuperficie = shop.superficie;
        this.editDescription = shop.description || '';
        this.editUserId = shop.id_user?._id || shop.id_user || '';
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger le shop';
        this.loading = false;
      }
    });

    this.authService.getUsers().subscribe({
      next: (users) => this.users = users,
      error: (err) => console.error('❌ Erreur users:', err)
    });
  }

  sauvegarderInfos(): void {
    const updates = {
      name: this.editNom,
      superficie: this.editSuperficie,
      description: this.editDescription
    };

    this.shopService.updateShop(this.shop._id, updates).subscribe({
      next: (shop) => {
        this.shop = shop;
        alert('Informations sauvegardées ✅');
      },
      error: (err) => console.error('❌ Erreur:', err)
    });
  }

  assignerUser(): void {
    if (!this.editUserId) return;

    this.shopService.updateShop(this.shop._id, {
      id_user: this.editUserId,
      status: 'actif'
    }).subscribe({
      next: (shop) => {
        this.shop = shop;
        alert('Locataire assigné ✅');
      },
      error: (err) => console.error('❌ Erreur:', err)
    });
  }

  desassignerUser(): void {
    this.shopService.updateShop(this.shop._id, {
      id_user: null,
      status: 'inactif'
    }).subscribe({
      next: (shop) => {
        this.shop = shop;
        this.editUserId = '';
        alert('Locataire retiré ✅');
      },
      error: (err) => console.error('❌ Erreur:', err)
    });
  }

  getUserNom(): string {
    if (!this.shop?.id_user) return '—';
    const user = this.users.find(u => u._id === (this.shop.id_user?._id || this.shop.id_user));
    return user ? `${user.firstname} ${user.name}` : '—';
  }

  retourDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}