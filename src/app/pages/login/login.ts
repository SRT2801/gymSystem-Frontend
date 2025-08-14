import { Component, AfterViewInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { Boton } from '../../components/boton/boton';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, Boton],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements AfterViewInit {
  loginForm: FormGroup;
  isLoading: boolean = false;
  loginError: string | null = null;
  googleAuthLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }
  onGoogleLogin() {
    this.googleAuthLoading = true;
    // Limpiamos errores anteriores
    this.loginError = null;
    // La autenticación con Google se maneja mediante redirección a la API backend.
    // environment.apiUrl = http://localhost:3000/api -> queremos http://localhost:3000/api/auth/google
    const googleUrl = `${environment.apiUrl}/auth/google`;
    window.location.href = googleUrl;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginError = null;

      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      };
      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          // Redirigir según el rol del usuario usando el método getRedirectUrl
          const redirectUrl = this.authService.getRedirectUrl();
          this.router.navigate([redirectUrl]).then(() => {
            window.scrollTo(0, 0);
          });
        },
        error: (err) => {
          this.isLoading = false;

          if (err.status === 401) {
            this.loginError = 'Credenciales incorrectas. Inténtalo de nuevo.';
          } else if (err.status === 0) {
            this.loginError =
              'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
          } else {
            this.loginError =
              'Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.';
          }
        },
      });
    } else {
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);

    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (controlName === 'email') {
      if (control.hasError('required')) {
        return 'El email es obligatorio';
      }
      if (control.hasError('email')) {
        return 'Por favor ingresa un email válido';
      }
    }

    if (controlName === 'password') {
      if (control.hasError('required')) {
        return 'La contraseña es obligatoria';
      }
    }

    return '';
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const header = document.querySelector('.login-header');
      if (header) header.classList.add('animate');

      setTimeout(() => {
        const card = document.querySelector('.login-card');
        if (card) card.classList.add('animate');
      }, 200);

      const animateWithDelay = (selector: string, delay: number) => {
        setTimeout(() => {
          const element = document.querySelector(selector);
          if (element) element.classList.add('animate');
        }, delay);
      };

      animateWithDelay('.slide-in-left', 400);
      animateWithDelay('.slide-in-right', 600);
      animateWithDelay('.form-options', 800);
      animateWithDelay('.form-submit', 1000);
      animateWithDelay('.oauth-separator', 1100);
      animateWithDelay('.google-login', 1200);
      animateWithDelay('.additional-links', 1300);
      animateWithDelay('.login-footer', 1400);
    }, 100);
  }
}
