import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-popup.component.html',
  styleUrl: './register-popup.component.css'
})
export class RegisterPopupComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<any>(); // émet l'utilisateur inscrit

  user = { name: '', firstname: '', email: '', password: '' };
  error = '';
  isLoading = false;

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.error = '';
    this.isLoading = true;

    this.authService.register(this.user).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Connexion auto après inscription
        this.authService.login(this.user.email, this.user.password).subscribe({
          next: () => {
            this.success.emit(response.user); // on renvoie l'utilisateur au parent
            this.close.emit();
          },
          error: () => this.error = 'Inscription réussie mais échec connexion auto'
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Erreur lors de l\'inscription';
      }
    });
  }

  closePopup() {
    this.close.emit();
  }
}