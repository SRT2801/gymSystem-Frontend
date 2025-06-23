import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Boton } from '../boton/boton';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule, Boton],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true,
})
export class Header implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  scrolled = false;
  isAuthenticated = false;
  userName: string = '';

  private authSubscription: Subscription = new Subscription();
  private userSubscription: Subscription = new Subscription();

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    // Suscribirse al estado de autenticación
    this.authSubscription = this.authService.authState$.subscribe(
      (isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
      }
    );

    // Suscribirse a los cambios del usuario actual
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.userName = user.name;
      } else {
        this.userName = '';
      }
    });
  }

  ngOnDestroy() {
    // Limpiar suscripciones para evitar memory leaks
    this.authSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 50;
  }

  @HostListener('window:resize', [])
  onResize() {
    if (window.innerWidth > 992 && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;

    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  navigateToAndClose(route: string) {
    this.closeMobileMenu();
    this.navigateTo(route);
  }
  logout() {
    this.authService.logout().subscribe({
      next: () => {
        // Ya no necesitamos actualizar manualmente isAuthenticated y userName
        // ya que estamos suscritos a los cambios del servicio

        // Redirección a la página principal después del logout
        this.router.navigate(['/login']);
      },
      error: () => {
        console.error('Error al cerrar sesión');
      },
    });
  }
}
