import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables, TooltipItem } from 'chart.js';
import { BlockService } from '../../../services/block.service';
import { GrilleService } from '../../../services/grille.service';
import { LoyerService, StatMensuelle } from '../../../services/loyer.service';
import { MaintenanceService } from '../../../services/maintenance.service';
import { NotificationService } from '../../../services/notification.service';
import { ShopService } from '../../../services/shop.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('chartEncaissement') chartEncaissementRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartOccupation')   chartOccupationRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartIncidents')    chartIncidentsRef!: ElementRef<HTMLCanvasElement>;

  private charts: Chart<any, any, any>[] = [];
  // Grille
  lignes = 5; colonnes = 5; grilleId = '';
  blockColors: Map<string, string> = new Map();
  blockShopIds: Map<string, string> = new Map();
  shops: any[] = [];

  // KPIs
  totalLocaux = 0; locauxOccupes = 0; locauxVacants = 0;
  loyersImpayes = 0; encaisseMonth = 0; attenduMonth = 0;
  maintenanceOuverts = 0; maintenanceUrgents = 0;
  notifNouveaux = 0;

  // Activité
  loyersRecents: any[] = [];
  ticketsUrgents: any[] = [];

  // Charts data
  statsMensuelles: StatMensuelle[] = [];
  maintenanceParCategorie: { cat: string; count: number; icon: string }[] = [];

  loading = true;

  // Flags pour savoir quand dessiner
  private shopsLoaded = false;
  private statsLoaded = false;
  private maintenanceLoaded = false;
  private viewReady = false;

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

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.tryInitCharts();
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
  }

  private tryInitCharts(): void {
    if (!this.viewReady) return;
    if (this.shopsLoaded)      this.initChartOccupation();
    if (this.statsLoaded)      this.initChartEncaissement();
    if (this.maintenanceLoaded) this.initChartIncidents();
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
      }
    });
  }

  chargerBlocs(): void {
    this.blockService.getBlocksByGrille(this.grilleId).subscribe({
      next: (blocks: any[]) => {
        this.blockColors.clear(); this.blockShopIds.clear();
        blocks.forEach(b => {
          if (b.color)  this.blockColors.set(b.blockId, b.color);
          if (b.shopId) this.blockShopIds.set(b.blockId, b.shopId);
        });
      }
    });
  }

  chargerShops(): void {
    this.shopService.getAllShops().subscribe({
      next: (shops) => {
        this.shops       = shops;
        this.totalLocaux = shops.length;
        this.locauxOccupes = shops.filter((s: any) => s.status === 'actif').length;
        this.locauxVacants = shops.filter((s: any) => s.status !== 'actif').length;
        this.loading = false;
        this.shopsLoaded = true;
        this.tryInitCharts();
      },
      error: () => { this.loading = false; }
    });
  }

  chargerLoyers(): void {
    this.loyerService.getDashboard().subscribe({
      next: (entries: any[]) => {
        this.loyersImpayes  = entries.filter(e => e.loyerMois.statut === 'en_retard').length;
        this.encaisseMonth  = entries.filter(e => e.loyerMois.statut === 'payé').reduce((s: number, e: any) => s + e.loyerMois.montant, 0);
        this.attenduMonth   = entries.reduce((s: number, e: any) => s + e.loyerMois.montant, 0);
        this.loyersRecents  = entries.filter(e => e.loyerMois.statut !== 'payé').slice(0, 5);
        // Refresh occupation chart avec les impayés
        if (this.shopsLoaded) this.initChartOccupation();
      }
    });

    this.loyerService.getStatsMensuelles().subscribe({
      next: (stats) => {
        this.statsMensuelles = stats;
        this.statsLoaded = true;
        this.tryInitCharts();
      }
    });
  }

  chargerMaintenance(): void {
    this.maintenanceService.getStats().subscribe({
      next: (s) => { this.maintenanceOuverts = s.total; this.maintenanceUrgents = s.urgents; }
    });

    this.maintenanceService.getAll().subscribe({
      next: (tickets) => {
        this.ticketsUrgents = tickets
          .filter(t => t.priorite === 'urgent' && t.statut !== 'résolu')
          .slice(0, 4);

        const cats = [
          { cat: 'électricité', icon: '⚡' }, { cat: 'plomberie', icon: '🔧' },
          { cat: 'structure', icon: '🧱' },   { cat: 'climatisation', icon: '❄️' },
          { cat: 'sécurité', icon: '🔒' },    { cat: 'nettoyage', icon: '🧹' },
          { cat: 'autre', icon: '📋' }
        ];
        this.maintenanceParCategorie = cats
          .map(c => ({
            ...c,
            count: tickets.filter(t => t.categorie === c.cat && t.statut !== 'résolu').length
          }))
          .filter(c => c.count > 0);

        this.maintenanceLoaded = true;
        this.tryInitCharts();
      }
    });
  }

  chargerNotifications(): void {
    this.notificationService.getAll().subscribe({
      next: (notifs) => {
        this.notifNouveaux = notifs.filter((n: any) => n.status === 'nouveau').length;
      }
    });
  }

  // ════════════════════════════════
  // CHARTS
  // ════════════════════════════════

  private destroyChart(canvas: HTMLCanvasElement): void {
    const idx = this.charts.findIndex(c => c.canvas === canvas);
    if (idx !== -1) { this.charts[idx].destroy(); this.charts.splice(idx, 1); }
  }

  initChartEncaissement(): void {
    const canvas = this.chartEncaissementRef?.nativeElement;
    if (!canvas || !this.statsMensuelles.length) return;
    this.destroyChart(canvas);
  
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.statsMensuelles.map(s => s.label),
        datasets: [
          {
            label: 'Encaissé (Ar)',
            data: this.statsMensuelles.map(s => s.encaisse),
            backgroundColor: 'rgba(168, 213, 162, 0.75)',
            borderColor: '#3a7a52',
            borderWidth: 1,
            borderRadius: 6,
            yAxisID: 'y'
          },
          {
            label: 'Impayés',
            data: this.statsMensuelles.map(s => s.nbEnRetard),
            type: 'line' as any,
            borderColor: '#d64545',
            backgroundColor: 'rgba(214,69,69,0.08)',
            borderWidth: 2,
            pointBackgroundColor: '#d64545',
            pointRadius: 4,
            tension: 0.4,
            fill: true,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { font: { size: 11 }, color: '#888', boxWidth: 12 } },
          tooltip: {
            callbacks: {
              label: (ctx: TooltipItem<'bar'>) => {
                const y = ctx.parsed?.y ?? 0;
                return ctx.datasetIndex === 0
                  ? ` ${y.toLocaleString('fr-FR')} Ar`
                  : ` ${y} impayé(s)`;
              }
            } // <-- fermeture manquante ajoutée ici
          }
        },
        scales: {
          y: {
            position: 'left',
            ticks: { font: { size: 10 }, color: '#aaa', callback: (v: number | string) => (Number(v) / 1000) + 'k Ar' },
            grid: { color: '#f5f0ec' }
          },
          y1: {
            position: 'right',
            ticks: { font: { size: 10 }, color: '#d64545', stepSize: 1 },
            grid: { drawOnChartArea: false }
          },
          x: {
            ticks: { font: { size: 10 }, color: '#aaa' },
            grid: { display: false }
          }
        }
      }
    });
  
    this.charts.push(chart);
  }
  initChartOccupation(): void {
    const canvas = this.chartOccupationRef?.nativeElement;
    if (!canvas || this.totalLocaux === 0) return;
    this.destroyChart(canvas);

    const occupesOk = Math.max(0, this.locauxOccupes - this.loyersImpayes);

    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Occupés — à jour', 'Occupés — impayé', 'Vacants'],
        datasets: [{
          data: [occupesOk, this.loyersImpayes, this.locauxVacants],
          backgroundColor: ['#a8d5a2', '#f0c080', '#e8e3de'],
          borderColor: ['#3a7a52', '#c07a3a', '#ccc'],
          borderWidth: 2,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 10 }, color: '#888', boxWidth: 10, padding: 12 } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label} : ${ctx.parsed} local(aux)`
            }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  initChartIncidents(): void {
    const canvas = this.chartIncidentsRef?.nativeElement;
    if (!canvas || !this.maintenanceParCategorie.length) return;
    this.destroyChart(canvas);

    const labels = this.maintenanceParCategorie.map(c => c.icon + ' ' + c.cat);
    const data   = this.maintenanceParCategorie.map(c => c.count);
    const bgColors = ['#fff8d4','#d4eeff','#ede8e3','#d4f0ff','#fde8e8','#d4edda','#f0ece6'];

    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Incidents ouverts',
          data,
          backgroundColor: bgColors.slice(0, data.length),
          borderRadius: 6,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.x} incident(s)` } }
        },
        scales: {
          x: {
            ticks: { font: { size: 10 }, color: '#aaa', stepSize: 1 },
            grid: { color: '#f5f0ec' }
          },
          y: {
            ticks: { font: { size: 11 }, color: '#555' },
            grid: { display: false }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  // ── Navigation ───────────────────────────────────────
  allerGrille():        void { this.router.navigate(['/grille']); }
  allerLocation():      void { this.router.navigate(['/location']); }
  allerMaintenance():   void { this.router.navigate(['/maintenance']); }
  allerNotifications(): void { this.router.navigate(['/notifications']); }
  ouvrirShop(shop: any): void { this.router.navigate(['/shop', shop._id, 'admin']); }

  // ── Helpers grille ───────────────────────────────────
  getLettres(): string[] { return Array.from({ length: this.lignes }, (_, i) => String.fromCharCode(65 + i)); }
  getNumeros(): number[] { return Array.from({ length: this.colonnes }, (_, i) => i + 1); }
  getBlockId(l: string, n: number): string { return `${l}${n}`; }
  getBlockColor(l: string, n: number): string | null { return this.blockColors.get(this.getBlockId(l, n)) || null; }
  isAssigned(l: string, n: number): boolean { return this.blockShopIds.has(this.getBlockId(l, n)); }
  getShopColor(shopId: string): string {
    for (const [blockId, sId] of this.blockShopIds) {
      if (sId === shopId) return this.blockColors.get(blockId) || '#e9ecef';
    }
    return '#e9ecef';
  }

  // ── Helpers calcul ───────────────────────────────────
  get tauxOccupation(): number {
    return this.totalLocaux > 0 ? Math.round((this.locauxOccupes / this.totalLocaux) * 100) : 0;
  }
  get tauxEncaissement(): number {
    return this.attenduMonth > 0 ? Math.round((this.encaisseMonth / this.attenduMonth) * 100) : 0;
  }
  statutLoyerLabel(s: string): string {
    const map: Record<string, string> = { en_attente: 'En attente', en_retard: 'Impayé', payé: 'Payé' };
    return map[s] ?? s;
  }
  formatMontant(n: number): string { return n.toLocaleString('fr-FR') + ' Ar'; }
  categorieIcon(cat: string): string {
    const map: Record<string, string> = {
      'électricité': '⚡','plomberie': '🔧','structure': '🧱',
      'climatisation': '❄️','sécurité': '🔒','nettoyage': '🧹','autre': '📋'
    };
    return map[cat] ?? '📋';
  }
}