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
  styleUrl: './register.component.css'   // tu peux réutiliser le même css que login
})
export class RegisterComponent {
  user = {
    name: '',
    firstname: '',
    email: '',
    password: ''
  };

  error: string = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.error = '';
    this.isLoading = true;

    this.authService.register(this.user).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Option 1 : connexion automatique après inscription
        this.authService.login(this.user.email, this.user.password).subscribe({
          next: () => this.router.navigate(['/landing']),
          error: () => this.error = 'Inscription réussie mais erreur lors de la connexion automatique'
        });
        
        // Option 2 (plus simple) : rediriger vers login
        // this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Une erreur est survenue lors de l\'inscription';
      }
    });
  }
}