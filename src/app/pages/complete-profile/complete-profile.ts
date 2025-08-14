import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Boton } from '../../components/boton/boton';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Boton],
  templateUrl: './complete-profile.html',
  styleUrl: './complete-profile.scss',
})
export class CompleteProfileComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;
  userIdFromQuery: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Si ya está autenticado y no necesita completar perfil, redirigir.
    if (
      this.authService.isAuthenticated() &&
      !this.authService.hasIncompleteProfileFlag()
    ) {
      this.router.navigate([this.authService.getRedirectUrl()]);
      return;
    }

    this.userIdFromQuery = this.route.snapshot.queryParamMap.get('userId');

    this.form = this.fb.group({
      phone: ['', [Validators.required, Validators.minLength(6)]],
      documentId: ['', [Validators.required, Validators.minLength(5)]],
      birthDate: ['', [Validators.required]],
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;
    const { phone, documentId, birthDate } = this.form.value;
    this.authService
      .completeProfile({
        phone,
        documentId,
        birthDate,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
          setTimeout(() => {
            this.router.navigate([this.authService.getRedirectUrl()]);
          }, 800);
        },
        error: (err) => {
          this.loading = false;
          if (err.status === 409) {
            this.error = err.error?.message || 'Conflicto de datos';
          } else {
            this.error =
              err.error?.message ||
              'Error al completar el perfil. Intenta nuevamente.';
          }
        },
      });
  }
}
