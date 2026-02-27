import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  user = {
    name: '',
    firstname: '',
    email: '',
    password: ''
  };

  errorMessage: string = '';
  isLoading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.errorMessage = '';
    this.isLoading = true;

    this.authService.register(this.user).subscribe({
      next: () => {
        this.isLoading = false;
        // Connexion automatique après inscription réussie
        this.authService.login(this.user.email, this.user.password).subscribe({
          next: () => {
            // Redirection gérée dans AuthService (dashboard-shop ou landing)
          },
          error: () => {
            this.errorMessage = 'Inscription réussie, mais impossible de vous connecter automatiquement. Veuillez vous connecter manuellement.';
          }
        });
      },
      error: (err) => {
        this.isLoading = false;

        // Messages d'erreur personnalisés selon la réponse backend
        const backendMsg = err.error?.message?.toLowerCase() || '';

        if (backendMsg.includes('email déjà')) {
          this.errorMessage = 'Cet email est déjà utilisé par un autre compte.';
        } else if (backendMsg.includes('mot de passe') || backendMsg.includes('longueur')) {
          this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
        } else if (backendMsg.includes('email invalide') || backendMsg.includes('format')) {
          this.errorMessage = 'Adresse email invalide.';
        } else if (backendMsg.includes('requis') || backendMsg.includes('obligatoire')) {
          this.errorMessage = 'Tous les champs marqués sont obligatoires.';
        } else {
          this.errorMessage = err.error?.message || 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
        }
      }
    });
  }
}