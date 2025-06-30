import {
  Component,
  Input,
  EventEmitter,
  Output,
  OnDestroy,
} from '@angular/core';
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
export class SidebarComponent implements OnDestroy {
  @Input() userRole: string = 'user';
  @Input() collapsed: boolean = false;
  @Output() sidebarToggle = new EventEmitter<boolean>();
  @Output() collapsedChange = new EventEmitter<boolean>();
  isMobile: boolean = false;

  menuItems: {
    title: string;
    route: string | null;
    icon: string;
    roles: string[];
    expanded?: boolean;
    submenu?: { title: string; route: string; icon: string; roles: string[] }[];
  }[] = [
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
    {
      title: 'Usuarios',
      route: null,
      icon: 'people',
      roles: ['admin'],
      submenu: [
        {
          title: 'Miembros',
          route: '/admin/members',
          icon: 'person_add',
          roles: ['admin'],
        },
      ],
    },
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

  private resizeHandler: () => void;

  constructor(private authService: AuthService, private router: Router) {
    this.checkIfMobile();
    this.resizeHandler = this.checkIfMobile.bind(this);
    window.addEventListener('resize', this.resizeHandler);
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

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

  toggleSubmenu(item: any) {
    item.expanded = !item.expanded;
  }

  toggleCollapsed() {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  expandSidebar() {
    if (this.collapsed) {
      this.collapsed = false;
      this.collapsedChange.emit(this.collapsed);
    }
  }

  closeSidebar() {
    this.sidebarToggle.emit(false);
  }

  closeSidebarOnNavigate() {
    if (window.innerWidth <= 768) {
      this.closeSidebar();
    }
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeHandler);
  }
}
