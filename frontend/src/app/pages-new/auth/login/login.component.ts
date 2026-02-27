import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  errorMessage: string = '';
  isLoading = false;
  showPassword = false;

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login(this.credentials.email, this.credentials.password).subscribe({
      next: () => {
        this.isLoading = false;
        // La redirection est déjà gérée dans AuthService
      },
      error: (err) => {
        this.isLoading = false;
        // Messages personnalisés selon l'erreur du backend
        const msg = err.error?.message?.toLowerCase() || '';
        if (msg.includes('token manquant') || msg.includes('token invalide')) {
          this.errorMessage = 'Session invalide. Veuillez vous reconnecter.';
        } else if (msg.includes('mot de passe') || msg.includes('incorrect')) {
          this.errorMessage = 'Mot de passe incorrect.';
        } else if (msg.includes('email') || msg.includes('utilisateur non trouvé')) {
          this.errorMessage = 'Adresse email invalide ou inexistante.';
        } else {
          this.errorMessage = err.error?.message || 'Une erreur est survenue. Réessayez.';
        }
      }
    });
  }
}