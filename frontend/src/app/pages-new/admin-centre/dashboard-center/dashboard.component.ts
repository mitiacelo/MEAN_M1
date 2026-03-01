import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlockService } from '../../../services/block.service';
import { GrilleService } from '../../../services/grille.service';
import { ShopService } from '../../../services/shop.service';
import { LoyerService } from '../../../services/loyer.service';
import { MaintenanceService } from '../../../services/maintenance.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  // Grille
  lignes: number = 5;
  colonnes: number = 5;
  grilleId: string = '';
  blockColors: Map<string, string> = new Map();
  blockShopIds: Map<string, string> = new Map();
  shops: any[] = [];

  // KPIs loyers
  totalLocaux = 0;
  locauxOccupes = 0;
  locauxVacants = 0;
  loyersImpayes = 0;
  encaisseMonth = 0;
  attenduMonth = 0;

  // KPIs maintenance
  maintenanceOuverts = 0;
  maintenanceUrgents = 0;

  // Notifications
  notifNouveaux = 0;

  // Loyers récents (5 derniers non payés)
  loyersRecents: any[] = [];

  // Tickets urgents
  ticketsUrgents: any[] = [];

  loading = true;

  constructor(
    private grilleService: GrilleService,
    private blockService: BlockService,
    private shopService: ShopService,
    private loyerService: LoyerService,
    private maintenanceService: MaintenanceService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerGrille();
    this.chargerShops();
    this.chargerLoyers();
    this.chargerMaintenance();
    this.chargerNotifications();
  }

  // ── Grille ───────────────────────────────────────────
  chargerGrille(): void {
    this.grilleService.getGrille().subscribe({
      next: (grille) => {
        if (grille) {
          this.grilleId = grille._id;
          this.lignes = grille.lignes;
          this.colonnes = grille.colonnes;
          this.chargerBlocs();
        }
      },
      error: (err) => console.error('❌ Erreur grille:', err)
    });
  }

  chargerBlocs(): void {
    this.blockService.getBlocksByGrille(this.grilleId).subscribe({
      next: (blocks: any[]) => {
        this.blockColors.clear();
        this.blockShopIds.clear();
        blocks.forEach(block => {
          if (block.color)  this.blockColors.set(block.blockId, block.color);
          if (block.shopId) this.blockShopIds.set(block.blockId, block.shopId);
        });
      },
      error: (err) => console.error('❌ Erreur blocs:', err)
    });
  }

  chargerShops(): void {
    this.shopService.getAllShops().subscribe({
      next: (shops) => {
        this.shops = shops;
        this.totalLocaux   = shops.length;
        this.locauxOccupes = shops.filter((s: any) => s.status === 'actif').length;
        this.locauxVacants = shops.filter((s: any) => s.status !== 'actif').length;
        this.loading = false;
      },
      error: (err) => { console.error('❌ Erreur shops:', err); this.loading = false; }
    });
  }

  // ── Loyers ───────────────────────────────────────────
  chargerLoyers(): void {
    this.loyerService.getDashboard().subscribe({
      next: (entries: any[]) => {
        this.loyersImpayes = entries.filter(e => e.loyerMois.statut === 'en_retard').length;
        this.encaisseMonth = entries
          .filter(e => e.loyerMois.statut === 'payé')
          .reduce((s: number, e: any) => s + e.loyerMois.montant, 0);
        this.attenduMonth = entries
          .reduce((s: number, e: any) => s + e.loyerMois.montant, 0);
        // 5 derniers non payés pour l'activité
        this.loyersRecents = entries
          .filter(e => e.loyerMois.statut !== 'payé')
          .slice(0, 5);
      },
      error: (err) => console.error('❌ Erreur loyers:', err)
    });
  }

  // ── Maintenance ──────────────────────────────────────
  chargerMaintenance(): void {
    this.maintenanceService.getStats().subscribe({
      next: (stats) => {
        this.maintenanceOuverts = stats.total;
        this.maintenanceUrgents = stats.urgents;
      }
    });
    this.maintenanceService.getAll({ priorite: 'urgent' }).subscribe({
      next: (tickets) => {
        this.ticketsUrgents = tickets.filter(t => t.statut !== 'résolu').slice(0, 4);
      }
    });
  }

  // ── Notifications ────────────────────────────────────
  chargerNotifications(): void {
    this.notificationService.getAll().subscribe({
      next: (notifs) => {
        this.notifNouveaux = notifs.filter((n: any) => n.status === 'nouveau').length;
      }
    });
  }

  // ── Navigation ───────────────────────────────────────
  allerGrille():        void { this.router.navigate(['/grille']); }
  allerLocation():      void { this.router.navigate(['/location']); }
  allerMaintenance():   void { this.router.navigate(['/maintenance']); }
  allerNotifications(): void { this.router.navigate(['/notifications']); }
  ouvrirShop(shop: any): void { this.router.navigate(['/shop', shop._id, 'admin']); }

  // ── Helpers grille ───────────────────────────────────
  getLettres(): string[] {
    return Array.from({ length: this.lignes }, (_, i) => String.fromCharCode(65 + i));
  }
  getNumeros(): number[] {
    return Array.from({ length: this.colonnes }, (_, i) => i + 1);
  }
  getBlockId(lettre: string, numero: number): string { return `${lettre}${numero}`; }
  getBlockColor(lettre: string, numero: number): string | null {
    return this.blockColors.get(this.getBlockId(lettre, numero)) || null;
  }
  isAssigned(lettre: string, numero: number): boolean {
    return this.blockShopIds.has(this.getBlockId(lettre, numero));
  }
  getShopColor(shopId: string): string {
    for (const [blockId, sId] of this.blockShopIds) {
      if (sId === shopId) return this.blockColors.get(blockId) || '#e9ecef';
    }
    return '#e9ecef';
  }

  // ── Helpers affichage ────────────────────────────────
  get tauxOccupation(): number {
    return this.totalLocaux > 0 ? Math.round((this.locauxOccupes / this.totalLocaux) * 100) : 0;
  }
  get tauxEncaissement(): number {
    return this.attenduMonth > 0 ? Math.round((this.encaisseMonth / this.attenduMonth) * 100) : 0;
  }

  statutLoyerLabel(statut: string): string {
    const map: Record<string, string> = { en_attente: 'En attente', en_retard: 'Impayé', payé: 'Payé' };
    return map[statut] ?? statut;
  }

  formatMontant(n: number): string {
    return n.toLocaleString('fr-FR') + ' Ar';
  }

  categorieIcon(cat: string): string {
    const map: Record<string, string> = {
      'électricité': '⚡', 'plomberie': '🔧', 'structure': '🧱',
      'climatisation': '❄️', 'sécurité': '🔒', 'nettoyage': '🧹', 'autre': '📋'
    };
    return map[cat] ?? '📋';
  }
}