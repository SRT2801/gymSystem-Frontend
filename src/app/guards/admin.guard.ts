import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  CanActivateFn,
  CanMatch,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate, CanMatch {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkAdminRole(state.url);
  }

  canMatch(route: Route, segments: UrlSegment[]): boolean {
    return this.checkAdminRole('/admin');
  }

  private checkAdminRole(url: string): boolean {
    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      return true;
    }

    // Si el usuario está autenticado pero no es admin, lo redirigimos a la página de inicio
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
      return false;
    }

    // Si el usuario no está autenticado, lo redirigimos a login
    this.router.navigate(['/login'], { queryParams: { returnUrl: url } });
    return false;
  }
}
