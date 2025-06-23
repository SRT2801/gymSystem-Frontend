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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginError = null;

      // Conectamos con nuestro backend real
      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      };
      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          // Login exitoso, redirigir a la página principal y asegurar que se vaya al inicio
          this.router.navigate(['/home']).then(() => {
            window.scrollTo(0, 0); // Scroll automático al inicio de la página
          });
        },
        error: (err) => {
          this.isLoading = false;
          // Manejar diferentes tipos de errores
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
      // Marcar todos los campos como tocados para mostrar errores de validación
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
      if (control.hasError('minlength')) {
        return 'La contraseña debe tener al menos 6 caracteres';
      }
    }

    return '';
  }

  ngAfterViewInit(): void {
    // Activar las animaciones manualmente con un pequeño retraso para que el DOM esté listo
    setTimeout(() => {
      // Animar el header
      const header = document.querySelector('.login-header');
      if (header) header.classList.add('animate');

      // Animar la tarjeta principal
      setTimeout(() => {
        const card = document.querySelector('.login-card');
        if (card) card.classList.add('animate');
      }, 200);

      // Animar el resto de elementos con incrementos de tiempo
      const animateWithDelay = (selector: string, delay: number) => {
        setTimeout(() => {
          const element = document.querySelector(selector);
          if (element) element.classList.add('animate');
        }, delay);
      };

      // Animar los campos del formulario y botones
      animateWithDelay('.slide-in-left', 400);
      animateWithDelay('.slide-in-right', 600);
      animateWithDelay('.form-options', 800);
      animateWithDelay('.form-submit', 1000);
      animateWithDelay('.additional-links', 1200);
      animateWithDelay('.login-footer', 1400);
    }, 100);
  }
}
