import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    try {
      this.router.navigate(['/login']);
      return false;
    } catch (error) {
      console.error('Error en AuthGuard:', error);
      this.router.navigate(['/login']);
      return false;
    }
  }
}
