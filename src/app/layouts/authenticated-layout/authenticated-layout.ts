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

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Determinar el rol del usuario basado en si es admin
    if (this.authService.isAdmin()) {
      this.userRole = 'admin';
    } else {
      // Aquí podrías añadir lógica adicional para otros roles
      this.userRole = 'user';
    }
  }
}
