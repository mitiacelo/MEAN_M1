import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Boutique, BoutiqueService } from '../../../services/boutique.service';
import { CentreService } from '../../../services/centre.service';
import { Shop, ShopService } from '../../../services/shop.service';

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
  centreName = '';

  collapsed  = false;
  mobileOpen = false;

  constructor(
    private shopService: ShopService,
    private boutiqueService: BoutiqueService,
    private centreService: CentreService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const cached = this.centreService.currentCentre;
    if (cached?.nom) {
      this.centreName = cached.nom;
    } else {
      this.centreService.getCentre().subscribe({
        next:  c  => this.centreName = c.nom || '',
        error: () => this.centreName = ''
      });
    }
    this.loadShopsAndBoutiques();
  }

  private loadShopsAndBoutiques(): void {
    const user = this.authService.currentUser;
    if (!user?.id) { this.loading = false; return; }

    this.shopService.getShopsByUser(user.id).subscribe({
      next: shops => {
        this.shops = shops;
        shops.forEach(shop => {
          this.boutiqueService.getMyBoutique(user.id).subscribe({
            next:  boutique => {
              this.boutiquesMap[shop._id] = boutique?.id_shop?._id === shop._id ? boutique : null;
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
      next:  boutiques => this.boutiques = boutiques,
      error: err       => console.error('Erreur chargement boutiques', err)
    });
  }

  selectShop(shop: Shop): void {
    this.selectedShop     = shop;
    this.selectedBoutique = this.boutiquesMap[shop._id] || null;
  }

  toggleCollapse(): void { this.collapsed  = !this.collapsed;  }
  toggleMobile():   void { this.mobileOpen = !this.mobileOpen; }
  closeMobile():    void { this.mobileOpen = false; }

  @HostListener('window:resize', ['$event'])
  onResize(e: Event): void {
    if ((e.target as Window).innerWidth > 768) this.mobileOpen = false;
  }
}