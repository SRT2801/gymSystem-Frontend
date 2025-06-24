import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
  standalone: true,
})
export class AdminComponent implements OnInit {
  adminName: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
  
    const user = this.authService.getUser();
    if (user && user.name) {
      this.adminName = user.name;
    }
  }
}
