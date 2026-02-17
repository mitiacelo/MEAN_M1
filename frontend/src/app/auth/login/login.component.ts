import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  error = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.authService.login(this.credentials.email, this.credentials.password).subscribe({
      next: () => {
        // NE METS PLUS DE router.navigate ICI !
        // La redirection est gérée dans AuthService
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur de connexion';
      }
    });
  }
}