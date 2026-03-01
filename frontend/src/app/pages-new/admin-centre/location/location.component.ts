import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardEntry, LoyerMois, LoyerService } from '../../../services/loyer.service';

export interface ShopItem {
  _id: string;
  shop: {
    _id: string;
    name: string;
    superficie: number;
    description?: string;
  };
  contract: {
    _id: string;
    loyer: number;
    charges: number;
    depot?: number;
    clauses?: string;
    dateDebut: string;
    dateFin: string;
    user: { _id: string; name: string; firstname: string; email: string; phone?: string };
    shop: { _id: string; name: string; superficie: number };
  } | null;
  loyerMois: LoyerMois | null;
  status: 'vacant' | 'occupé' | 'en_retard';
}

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location.component.html',
  styleUrl: './location.component.css'
})
export class LocationComponent implements OnInit {

  shops: ShopItem[] = [];
  loading = true;

  viewMode: 'list' | 'grid' = 'list';

  activeFilter: 'tous' | 'occupé' | 'vacant' | 'impayé' = 'tous';
  searchQuery = '';

  selectedShop: ShopItem | null = null;

  historique: LoyerMois[] = [];
  loadingHistorique = false;

  confirmingId: string | null = null;
  noteInput = '';

  constructor(private loyerService: LoyerService) {}

  ngOnInit(): void { this.charger(); }

  charger(): void {
    this.loading = true;
    this.loyerService.getDashboard().subscribe({
      next: (entries: DashboardEntry[]) => {
        this.shops = entries.map(e => {
          const computedStatus: 'vacant' | 'occupé' | 'en_retard' =
            e.loyerMois.statut === 'en_retard' ? 'en_retard' : 'occupé';

          const item: ShopItem = {
            _id: e.contract.shop._id,
            shop: {
              _id: e.contract.shop._id,
              name: e.contract.shop.name,
              superficie: e.contract.shop.superficie,
            },
            contract: {
              _id: e.contract._id,
              loyer: e.contract.loyer,
              charges: e.contract.charges,
              dateDebut: e.contract.dateDebut,
              dateFin: e.contract.dateFin,
              user: e.contract.user,
              shop: e.contract.shop,
            },
            loyerMois: e.loyerMois,
            status: computedStatus
          };
          return item;
        });
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // ── Filtres ──────────────────────────────────────────
  get filteredShops(): ShopItem[] {
    let list = this.shops;

    if (this.activeFilter === 'occupé') list = list.filter(s => s.contract !== null);
    if (this.activeFilter === 'vacant') list = list.filter(s => s.contract === null);
    if (this.activeFilter === 'impayé') list = list.filter(s => s.loyerMois?.statut === 'en_retard');

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(s =>
        s.shop.name.toLowerCase().includes(q) ||
        (s.contract?.user.name ?? '').toLowerCase().includes(q) ||
        (s.contract?.user.firstname ?? '').toLowerCase().includes(q) ||
        (s.contract?.user.email ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }

  // ── KPIs ─────────────────────────────────────────────
  get totalLocaux():  number { return this.shops.length; }
  get totalOccupes(): number { return this.shops.filter(s => s.contract !== null).length; }
  get totalVacants(): number { return this.shops.filter(s => s.contract === null).length; }
  get totalImpayes(): number { return this.shops.filter(s => s.loyerMois?.statut === 'en_retard').length; }
  get totalEncaisse(): number {
    return this.shops
      .filter(s => s.loyerMois?.statut === 'payé')
      .reduce((sum, s) => sum + (s.loyerMois?.montant ?? 0), 0);
  }
  get totalAttendu(): number {
    return this.shops
      .filter(s => s.contract !== null)
      .reduce((sum, s) => sum + (s.loyerMois?.montant ?? ((s.contract!.loyer + s.contract!.charges))), 0);
  }

  // ── Drawer ───────────────────────────────────────────
  ouvrirDetail(item: ShopItem): void {
    this.selectedShop = item;
    this.confirmingId = null;
    this.noteInput = '';
    this.historique = [];

    if (item.contract) {
      this.loadingHistorique = true;
      this.loyerService.getHistorique(item.contract._id).subscribe({
        next: (data) => { this.historique = data; this.loadingHistorique = false; },
        error: () => { this.loadingHistorique = false; }
      });
    }
  }

  fermerDetail(): void {
    this.selectedShop = null;
    this.historique = [];
    this.confirmingId = null;
  }

  assignerLocal(): void {
    // Naviguer vers création de contrat :
    // this.router.navigate(['/admin/contracts/new'], { queryParams: { shopId: this.selectedShop!.shop._id } });
    console.log('Assigner local', this.selectedShop?.shop._id);
  }

  // ── Paiement ─────────────────────────────────────────
  ouvrirConfirmation(item: ShopItem): void {
    this.confirmingId = item.loyerMois!._id;
    this.noteInput = '';
  }

  confirmerPaiement(item: ShopItem): void {
    if (!item.loyerMois) return;
    this.loyerService.confirmerPaiement(item.loyerMois._id, this.noteInput).subscribe({
      next: (updated) => {
        item.loyerMois = updated;
        item.status = 'occupé';
        if (this.selectedShop?.shop._id === item.shop._id) {
          this.selectedShop = { ...item };
        }
        this.confirmingId = null;
        this.noteInput = '';
      },
      error: (err) => console.error(err)
    });
  }

  annulerConfirmation(): void {
    this.confirmingId = null;
    this.noteInput = '';
  }

  annulerPaiement(item: ShopItem): void {
    if (!item.loyerMois || !confirm('Annuler ce paiement ?')) return;
    this.loyerService.annulerPaiement(item.loyerMois._id).subscribe({
      next: (updated) => {
        item.loyerMois = updated;
        if (this.selectedShop?.shop._id === item.shop._id) {
          this.selectedShop = { ...item };
        }
      },
      error: (err) => console.error(err)
    });
  }

  // ── Helpers ──────────────────────────────────────────
  isExpirantBientot(contract: ShopItem['contract']): boolean {
    if (!contract?.dateFin) return false;
    const diff = new Date(contract.dateFin).getTime() - Date.now();
    return diff > 0 && diff < 60 * 24 * 60 * 60 * 1000;
  }

  nomMois(mois: number, annee: number): string {
    return new Date(annee, mois - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  moisCourantLabel(): string {
    return new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  statutLabel(statut: string): string {
    const map: Record<string, string> = {
      en_attente: 'En attente',
      payé: 'Payé',
      en_retard: 'En retard',
      vacant: 'Vacant'
    };
    return map[statut] ?? statut;
  }
}