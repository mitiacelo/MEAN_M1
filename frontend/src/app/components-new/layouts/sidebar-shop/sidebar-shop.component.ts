import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ShopService, Shop } from '../../../services/shop.service';
import { BoutiqueService, Boutique } from '../../../services/boutique.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar-shop',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './sidebar-shop.component.html',
  styleUrls: ['./sidebar-shop.component.css']
})
export class SidebarShopComponent implements OnInit {
  shops: Shop[] = [];
  boutiquesMap: { [shopId: string]: Boutique | null } = {};
  selectedShop: Shop | null = null;
  selectedBoutique: Boutique | null = null;
  loading = true;
  boutiques: Boutique[] = [];

  constructor(
    private shopService: ShopService,
    private boutiqueService: BoutiqueService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadShopsAndBoutiques();
  }

  private loadShopsAndBoutiques(): void {
    const user = this.authService.currentUser;
    if (!user?.id) {
      this.loading = false;
      return;
    }

    this.shopService.getShopsByUser(user.id).subscribe({
      next: (shops) => {
        this.shops = shops;

        shops.forEach(shop => {
          this.boutiqueService.getMyBoutique(user.id).subscribe({
            next: (boutique) => {
              if (boutique && boutique.id_shop?._id === shop._id) {
                this.boutiquesMap[shop._id] = boutique;
              } else {
                this.boutiquesMap[shop._id] = null;
              }
            },
            error: () => this.boutiquesMap[shop._id] = null
          });
        });

        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadBoutiques(): void {
    const user = this.authService.currentUser;
    if (!user?.id) return;
  
    this.boutiqueService.getMyBoutiques(user.id).subscribe({
      next: (boutiques) => {
        this.boutiques = boutiques; // ← plus de filtre status
        // Ou si tu veux filtrer sur autre chose (ex. active si boutique a id_shop)
        // this.boutiques = boutiques.filter(b => !!b.id_shop);
      },
      error: err => console.error('Erreur chargement boutiques', err)
    });
  }

  selectShop(shop: Shop): void {
    this.selectedShop = shop;
    this.selectedBoutique = this.boutiquesMap[shop._id] || null;

    // Optionnel : tu peux stocker selectedBoutique dans un service partagé
    // pour que dashboard-shop le récupère, ou passer par un événement
    console.log('Salle sélectionnée :', shop.name, 'Boutique :', this.selectedBoutique?.name);
  }
}