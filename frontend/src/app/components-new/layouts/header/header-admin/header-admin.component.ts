import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
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
  pendingCount = 0;
  urgentsCount = 0;

  constructor(
    private notificationService: NotificationService,
    private maintenanceService: MaintenanceService
  ) {}

  ngOnInit(): void {
    this.notificationService.getAll().subscribe({
      next: (notifs) => {
        this.pendingCount = notifs.filter(n => n.status === 'nouveau').length;
      },
      error: (err) => console.error(err)
    });

    this.maintenanceService.getStats().subscribe({
      next: (stats) => {
        this.urgentsCount = stats.urgents;
      },
      error: (err) => console.error(err)
    });
  }

  logout(): void {
    // TODO: appeler AuthService.logout() puis rediriger
    console.log('logout');
  }
}