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
  isAdmin = false;

  private authSubscription: Subscription = new Subscription();
  private userSubscription: Subscription = new Subscription();

  constructor(private router: Router, private authService: AuthService) {
    this.initializeUserState();
  }
  private initializeUserState(): void {
    const user = this.authService.getUser();
    if (user) {
      this.isAuthenticated = true;
      this.userName = user.name || '';
      this.isAdmin = this.authService.isAdmin();
    }
  }

  ngOnInit() {
    // Si no tenemos usuario cargado pero podría existir cookie httpOnly, forzamos verificación.
    if (!this.isAuthenticated) {
      this.authService.verifySessionWithBackend();
    }
    this.authSubscription = this.authService.authState$.subscribe(
      (isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;

        if (!isAuthenticated) {
          this.userName = '';
        }
      }
    );
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      if (user && user.name) {
        this.userName = user.name;
        this.isAuthenticated = true;
        this.isAdmin = this.authService.isAdmin();
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
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
        this.router.navigate(['/home']);
      },
      error: () => {
        this.router.navigate(['/home']);
      },
    });
  }
}
