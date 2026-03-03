import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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

  constructor(
    private authService: AuthService,
    private centreService: CentreService,
    private notificationService: NotificationService,
    private maintenanceService: MaintenanceService
  ) {}

  ngOnInit(): void {
    // Nom du centre → remplace "Mall" dans la sidebar
    this.centreService.getCentre().subscribe({
      next: c  => this.centreName = c.nom || '',
      error: () => this.centreName = ''
    });

    // Badge notifications en attente
    this.notificationService.getAll().subscribe({
      next: notifs => this.pendingCount = notifs.filter(n => n.status === 'nouveau').length,
      error: err   => console.error(err)
    });

    // Badge tickets urgents non résolus
    this.maintenanceService.getStats().subscribe({
      next: stats => this.urgentsCount = stats.urgents,
      error: err  => console.error(err)
    });
  }

  logout(): void {
    this.authService.logout();
  }
}