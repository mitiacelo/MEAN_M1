import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { CentreService } from '../../../../services/centre.service';
import { MaintenanceService } from '../../../../services/maintenance.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header-admin.component.html',
  styleUrls: ['./header-admin.component.css']
})
export class AdminLayoutComponent implements OnInit {
  centreName   = '';
  pendingCount = 0;
  urgentsCount = 0;

  collapsed  = false;  // desktop : icônes seules
  mobileOpen = false;  // mobile  : sidebar ouverte

  constructor(
    private authService: AuthService,
    private centreService: CentreService,
    private notificationService: NotificationService,
    private maintenanceService: MaintenanceService
  ) {}

  ngOnInit(): void {
    this.centreService.getCentre().subscribe({
      next:  c  => this.centreName = c.nom || '',
      error: () => this.centreName = ''
    });

    this.notificationService.getAll().subscribe({
      next:  notifs => this.pendingCount = notifs.filter(n => n.status === 'nouveau').length,
      error: err    => console.error(err)
    });

    this.maintenanceService.getStats().subscribe({
      next:  stats => this.urgentsCount = stats.urgents,
      error: err   => console.error(err)
    });
  }

  toggleCollapse(): void { this.collapsed  = !this.collapsed;  }
  toggleMobile():   void { this.mobileOpen = !this.mobileOpen; }
  closeMobile():    void { this.mobileOpen = false; }

  @HostListener('window:resize', ['$event'])
  onResize(e: Event): void {
    if ((e.target as Window).innerWidth > 768) this.mobileOpen = false;
  }

  logout(): void { this.authService.logout(); }
}