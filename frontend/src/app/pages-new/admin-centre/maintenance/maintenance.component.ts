import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { MaintenanceService, MaintenanceStats, MaintenanceTicket } from '../../../services/maintenance.service';
import { ShopService } from '../../../services/shop.service';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './maintenance.component.html',
  styleUrl: './maintenance.component.css'
})
export class MaintenanceComponent implements OnInit {

  tickets: MaintenanceTicket[] = [];
  stats: MaintenanceStats = { total: 0, urgents: 0, enCours: 0, resolusThisMois: 0 };
  loading = true;

  // Filtres
  activeFilter: 'tous' | 'ouvert' | 'en_cours' | 'résolu' | 'urgent' = 'tous';
  searchQuery = '';

  // Drawer détail
  selectedTicket: MaintenanceTicket | null = null;
  editingStatut = false;
  newStatut = '';
  noteResolution = '';
  dateIntervention = '';
  savingStatut = false;

  // Modale création
  showCreate = false;
  creating = false;
  shops: any[] = [];       // liste des salles pour le dropdown
  newTicket = {
    shopId: '',
    titre: '',
    description: '',
    categorie: 'autre',
    priorite: 'normal'
  };

  constructor(
    private maintenanceService: MaintenanceService,
    private authService: AuthService,
    private shopService: ShopService
  ) {}

  ngOnInit(): void {
    this.charger();
    this.chargerShops();
  }

  charger(): void {
    this.loading = true;
    this.maintenanceService.getAll().subscribe({
      next: (data) => { this.tickets = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.maintenanceService.getStats().subscribe({
      next: (s) => { this.stats = s; }
    });
  }

  chargerShops(): void {
    this.shopService.getAllShops().subscribe({
      next: (shops) => { this.shops = shops; }
    });
  }

  // ── Filtres ──────────────────────────────────────────
  get filteredTickets(): MaintenanceTicket[] {
    let list = this.tickets;
    if (this.activeFilter === 'ouvert')   list = list.filter(t => t.statut === 'ouvert');
    if (this.activeFilter === 'en_cours') list = list.filter(t => t.statut === 'en_cours');
    if (this.activeFilter === 'résolu')   list = list.filter(t => t.statut === 'résolu');
    if (this.activeFilter === 'urgent')   list = list.filter(t => t.priorite === 'urgent' && t.statut !== 'résolu');
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(t =>
        t.titre.toLowerCase().includes(q) ||
        t.shop.name.toLowerCase().includes(q) ||
        t.signalePar.firstname.toLowerCase().includes(q) ||
        t.signalePar.name.toLowerCase().includes(q)
      );
    }
    return list;
  }

  get countOuverts(): number { return this.tickets.filter(t => t.statut === 'ouvert').length; }
  get countEnCours(): number { return this.tickets.filter(t => t.statut === 'en_cours').length; }
  get countUrgents(): number { return this.tickets.filter(t => t.priorite === 'urgent' && t.statut !== 'résolu').length; }
  get countResolus(): number { return this.tickets.filter(t => t.statut === 'résolu').length; }

  // ── Drawer ───────────────────────────────────────────
  ouvrirDetail(ticket: MaintenanceTicket): void {
    this.selectedTicket = ticket;
    this.editingStatut = false;
    this.newStatut = ticket.statut;
    this.noteResolution = ticket.noteResolution || '';
    this.dateIntervention = ticket.dateIntervention ? ticket.dateIntervention.substring(0, 10) : '';
  }

  fermerDetail(): void { this.selectedTicket = null; this.editingStatut = false; }
  ouvrirEditionStatut(): void { this.editingStatut = true; }

  sauvegarderStatut(): void {
    if (!this.selectedTicket) return;
    this.savingStatut = true;
    this.maintenanceService.updateStatut(
      this.selectedTicket._id,
      this.newStatut,
      this.noteResolution,
      this.dateIntervention || undefined
    ).subscribe({
      next: (updated) => {
        const idx = this.tickets.findIndex(t => t._id === updated._id);
        if (idx !== -1) this.tickets[idx] = updated;
        this.selectedTicket = updated;
        this.editingStatut = false;
        this.savingStatut = false;
        this.maintenanceService.getStats().subscribe(s => this.stats = s);
      },
      error: () => { this.savingStatut = false; }
    });
  }

  supprimerTicket(ticket: MaintenanceTicket): void {
    if (!confirm(`Supprimer le ticket "${ticket.titre}" ?`)) return;
    this.maintenanceService.delete(ticket._id).subscribe({
      next: () => {
        this.tickets = this.tickets.filter(t => t._id !== ticket._id);
        if (this.selectedTicket?._id === ticket._id) this.fermerDetail();
        this.maintenanceService.getStats().subscribe(s => this.stats = s);
      }
    });
  }

  // ── Création ─────────────────────────────────────────
  ouvrirCreation(): void {
    this.newTicket = { shopId: '', titre: '', description: '', categorie: 'autre', priorite: 'normal' };
    this.showCreate = true;
  }

  creerTicket(): void {
    console.log('🔧 creerTicket appelé', this.newTicket);

    if (!this.newTicket.titre || !this.newTicket.shopId) {
      console.warn('❌ Validation échouée — titre:', this.newTicket.titre, '| shopId:', this.newTicket.shopId);
      return;
    }

    const user = this.authService.currentUser;
    console.log('👤 User connecté:', user);
    if (!user) {
      console.warn('❌ Aucun user connecté');
      return;
    }

    this.creating = true;
    const payload = {
      shopId: this.newTicket.shopId,
      userId: user.id,
      titre: this.newTicket.titre,
      description: this.newTicket.description,
      categorie: this.newTicket.categorie,
      priorite: this.newTicket.priorite
    };
    console.log('📤 Payload envoyé:', payload);

    this.maintenanceService.create(payload).subscribe({
      next: (ticket) => {
        console.log('✅ Ticket créé:', ticket);
        this.tickets.unshift(ticket);
        this.showCreate = false;
        this.creating = false;
        this.maintenanceService.getStats().subscribe(s => this.stats = s);
      },
      error: (err) => {
        console.error('❌ Erreur création:', err);
        this.creating = false;
      }
    });
  }

  // ── Helpers ──────────────────────────────────────────
  formatDate(date: string | null | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatDateTime(date: string | null | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  categorieIcon(cat: string): string {
    const map: Record<string, string> = {
      'électricité': '⚡', 'plomberie': '🔧', 'structure': '🧱',
      'climatisation': '❄️', 'sécurité': '🔒', 'nettoyage': '🧹', 'autre': '📋'
    };
    return map[cat] ?? '📋';
  }

  prioriteLabel(p: string): string {
    const map: Record<string, string> = { urgent: 'Urgent', normal: 'Normal', faible: 'Faible' };
    return map[p] ?? p;
  }

  statutLabel(s: string): string {
    const map: Record<string, string> = { ouvert: 'Ouvert', en_cours: 'En cours', résolu: 'Résolu', annulé: 'Annulé' };
    return map[s] ?? s;
  }

  joursDepuis(date: string): number {
    return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  }
}