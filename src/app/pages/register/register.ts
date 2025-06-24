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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, Boton],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements AfterViewInit {
  registerForm: FormGroup;
  isLoading: boolean = false;
  registerError: string | null = null;
  registerSuccess: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        phone: [
          '',
          [Validators.required, Validators.pattern(/^[0-9\-\+\s\(\)\.]+$/)],
        ],
        documentId: ['', [Validators.required]],
        birthDate: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
      return null;
    }
  }
  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.registerError = null;
      this.registerSuccess = false;
      const userData = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        phone: this.registerForm.value.phone,
        documentId: this.registerForm.value.documentId,
        birthDate: this.registerForm.value.birthDate,
      };
      this.authService.register(userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.registerError = null;
          this.registerSuccess = true;
          setTimeout(() => {
            const redirectUrl = this.authService.getRedirectUrl();
            this.router.navigate([redirectUrl]).then(() => {
              window.scrollTo(0, 0);
            });
          }, 2000);
        },        error: (err) => {
          console.error('Error de registro:', err);
          this.isLoading = false;
          this.registerSuccess = false;          // Capturar errores específicos según la respuesta del backend
          if (err.status === 409) {
            if (err.error && err.error.message) {
              // Mostrar el mensaje exacto del backend para mayor claridad
              this.registerError = err.error.message;

              // Si el backend no proporciona un mensaje suficientemente claro, lo mejoramos
              if (!this.registerError) {
                if (err.error.field === 'email' || (err.error.message && err.error.message.includes('email'))) {
                  this.registerError = 
                    'El email ya está registrado. Por favor utiliza otro email.';
                } else if (err.error.field === 'documentId' || (err.error.message && err.error.message.includes('documentId'))) {
                  this.registerError = 
                    'El documento de identidad ya está registrado. Por favor verifica tus datos.';
                } else {
                  this.registerError = 
                    'Ya existe una cuenta con estos datos. Por favor verifica la información.';
                }
              }
            } else {
              this.registerError =
                'Ya existe una cuenta con estos datos. Por favor verifica la información.';
            }          } else if (err.status === 0) {
            this.registerError =
              'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
          } else if (err.status === 400 && err.error) {
            // Error de validación del servidor - mostrar el mensaje exacto
            if (err.error.message) {
              this.registerError = err.error.message;
            } else if (typeof err.error === 'string') {
              this.registerError = err.error;
            } else {
              // Si hay errores de validación en formato de campo específico
              const errorFields = Object.keys(err.error);
              if (errorFields.length > 0) {
                // Construir un mensaje amigable con todos los errores
                const errorMessages = errorFields.map(field => {
                  const fieldName = this.getFieldDisplayName(field);
                  const errorMsg = err.error[field];
                  return `${fieldName}: ${errorMsg}`;
                });
                this.registerError = `Por favor corrige los siguientes errores: ${errorMessages.join(', ')}`;
              } else {
                this.registerError = 'Error de validación en el formulario. Por favor verifica tus datos.';
              }
            }
          } else {
            this.registerError =
              'Error al registrar. Por favor, inténtalo de nuevo más tarde.';
          }
        },
      });
    } else {
      Object.keys(this.registerForm.controls).forEach((key) => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);

    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (controlName === 'name') {
      if (control.hasError('required')) {
        return 'El nombre es obligatorio';
      }
      if (control.hasError('minlength')) {
        return 'El nombre debe tener al menos 3 caracteres';
      }
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
    if (controlName === 'confirmPassword') {
      if (control.hasError('required')) {
        return 'Confirma tu contraseña';
      }
      if (control.hasError('passwordMismatch')) {
        return 'Las contraseñas no coinciden';
      }
    }
    if (controlName === 'phone') {
      if (control.hasError('required')) {
        return 'El número de teléfono es obligatorio';
      }
      if (control.hasError('pattern')) {
        return 'Por favor, ingresa un número de teléfono válido';
      }
    }

    if (controlName === 'documentId') {
      if (control.hasError('required')) {
        return 'El documento de identidad es obligatorio';
      }
    }

    if (controlName === 'birthDate') {
      if (control.hasError('required')) {
        return 'La fecha de nacimiento es obligatoria';
      }
    }

    return '';
  }

  // Función para obtener nombres amigables de los campos en mensajes de error
  getFieldDisplayName(fieldName: string): string {
    const fieldMap: Record<string, string> = {
      name: 'Nombre',
      email: 'Email',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      phone: 'Teléfono',
      documentId: 'Documento de Identidad',
      birthDate: 'Fecha de Nacimiento'
    };
    
    return fieldMap[fieldName] || fieldName;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const header = document.querySelector('.register-header');
      if (header) header.classList.add('animate');

      setTimeout(() => {
        const card = document.querySelector('.register-card');
        if (card) card.classList.add('animate');
      }, 200);
      const formGroups = document.querySelectorAll('.form-group');
      const totalRows = Math.ceil(formGroups.length / 2);

      formGroups.forEach((element, index) => {
        const row = Math.floor(index / 2);
        const delay = 400 + row * 150;

        setTimeout(() => {
          element.classList.add('animate');
        }, delay);
      });

      setTimeout(() => {
        const formSubmit = document.querySelector('.form-submit');
        if (formSubmit) formSubmit.classList.add('animate');

        setTimeout(() => {
          const additionalLinks = document.querySelector('.additional-links');
          if (additionalLinks) additionalLinks.classList.add('animate');

          setTimeout(() => {
            const footer = document.querySelector('.register-footer');
            if (footer) footer.classList.add('animate');
          }, 200);
        }, 200);
      }, 1000);
    }, 100);
  }
}
