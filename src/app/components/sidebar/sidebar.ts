import { Component, Input } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class SidebarComponent {
  @Input() userRole: string = 'user';

  menuItems: { title: string; route: string; icon: string; roles: string[] }[] =
    [
      {
        title: 'Dashboard',
        route: '/dashboard',
        icon: 'dashboard',
        roles: ['user', 'admin', 'trainer'],
      },
      {
        title: 'Mi Perfil',
        route: '/profile',
        icon: 'person',
        roles: ['user', 'admin', 'trainer'],
      },
      {
        title: 'Clases',
        route: '/classes',
        icon: 'fitness_center',
        roles: ['user', 'trainer'],
      },
      {
        title: 'Membresías',
        route: '/memberships',
        icon: 'card_membership',
        roles: ['user'],
      },
      { title: 'Usuarios', route: '/users', icon: 'people', roles: ['admin'] },
      {
        title: 'Reportes',
        route: '/reports',
        icon: 'bar_chart',
        roles: ['admin'],
      },
      {
        title: 'Entrenamiento',
        route: '/training',
        icon: 'sports',
        roles: ['trainer'],
      },
    ];

  constructor(private authService: AuthService, private router: Router) {}

  get filteredMenuItems() {
    return this.menuItems.filter((item) => item.roles.includes(this.userRole));
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
