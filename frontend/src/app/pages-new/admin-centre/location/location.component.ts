import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardEntry, LoyerMois, LoyerService } from '../../../services/loyer.service';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location.component.html',
  styleUrl: './location.component.css'
})
export class LocationComponent implements OnInit {
  entries: DashboardEntry[] = [];
  loading = true;

  // Historique
  selectedEntry: DashboardEntry | null = null;
  historique: LoyerMois[] = [];
  loadingHistorique = false;
  showHistorique = false;

  // Confirmation paiement
  confirmingId: string | null = null;
  noteInput = '';

  constructor(private loyerService: LoyerService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.loyerService.getDashboard().subscribe({
      next: (data) => { this.entries = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  // ── Stats rapides ────────────────────────────────────
  get totalLocataires(): number { return this.entries.length; }
  get totalPayes(): number { return this.entries.filter(e => e.loyerMois.statut === 'payé').length; }
  get totalEnAttente(): number { return this.entries.filter(e => e.loyerMois.statut === 'en_attente').length; }
  get totalEnRetard(): number { return this.entries.filter(e => e.loyerMois.statut === 'en_retard').length; }
  get totalEncaisse(): number {
    return this.entries
      .filter(e => e.loyerMois.statut === 'payé')
      .reduce((sum, e) => sum + e.loyerMois.montant, 0);
  }
  get totalAttendu(): number {
    return this.entries.reduce((sum, e) => sum + e.loyerMois.montant, 0);
  }

  // ── Confirmer paiement ───────────────────────────────
  ouvrirConfirmation(entry: DashboardEntry): void {
    this.confirmingId = entry.loyerMois._id;
    this.noteInput = '';
  }

  confirmerPaiement(entry: DashboardEntry): void {
    this.loyerService.confirmerPaiement(entry.loyerMois._id, this.noteInput).subscribe({
      next: (updated) => {
        entry.loyerMois = updated;
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

  annulerPaiement(entry: DashboardEntry): void {
    if (!confirm('Annuler ce paiement ?')) return;
    this.loyerService.annulerPaiement(entry.loyerMois._id).subscribe({
      next: (updated) => { entry.loyerMois = updated; },
      error: (err) => console.error(err)
    });
  }

  // ── Historique ───────────────────────────────────────
  voirHistorique(entry: DashboardEntry): void {
    this.selectedEntry = entry;
    this.showHistorique = true;
    this.loadingHistorique = true;
    this.loyerService.getHistorique(entry.contract._id).subscribe({
      next: (data) => { this.historique = data; this.loadingHistorique = false; },
      error: () => { this.loadingHistorique = false; }
    });
  }

  fermerHistorique(): void {
    this.showHistorique = false;
    this.selectedEntry = null;
    this.historique = [];
  }

  // ── Helpers ──────────────────────────────────────────
  nomMois(mois: number, annee: number): string {
    return new Date(annee, mois - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  moisCourantLabel(): string {
    return new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  statutLabel(statut: string): string {
    const map: Record<string, string> = {
      en_attente: 'En attente',
      payé: 'Payé',
      en_retard: 'En retard'
    };
    return map[statut] ?? statut;
  }
}