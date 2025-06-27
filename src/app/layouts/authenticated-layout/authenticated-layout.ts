import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-authenticated-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, SidebarComponent, Header],
  templateUrl: './authenticated-layout.html',
  styleUrls: ['./authenticated-layout.scss'],
})
export class AuthenticatedLayoutComponent implements OnInit {
  userRole: string = 'user';
  sidebarVisible: boolean = false;
  sidebarCollapsed: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    if (this.authService.isAdmin()) {
      this.userRole = 'admin';
    } else {
      this.userRole = 'user';
    }

    // En escritorio mostrar sidebar por defecto
    this.sidebarVisible = window.innerWidth > 768;

    // Comprobar si hay una preferencia guardada para el sidebar colapsado
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    this.sidebarCollapsed = savedCollapsedState === 'true';
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  closeSidebar() {
    this.sidebarVisible = false;
  }

  onSidebarCollapsedChange(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
    localStorage.setItem('sidebarCollapsed', String(collapsed));
  }
}
