import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'gymSystemFrontend';

  constructor(private authService: AuthService, private router: Router) {}
  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      const redirectUrl = this.authService.getRedirectUrl();
      if (
        window.location.pathname === '/' ||
        window.location.pathname === '/home'
      ) {
        this.router.navigate([redirectUrl]);
      }
    }

   
  }
}
