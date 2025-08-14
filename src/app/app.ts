import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'gymSystemFrontend';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    const urlParams = new URLSearchParams(window.location.search);
    const auth = urlParams.get('auth');
    const completeProfile = urlParams.get('completeProfile');
    const userId = urlParams.get('userId');

    if (auth === 'success') {
      if (completeProfile === 'true') {

        this.authService.setIncompleteProfileFlag(true);
      }

      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }


    this.authService.verifySessionWithBackend();


    const sub = this.authService.currentUser$.subscribe((user) => {
      if (!user) return;

      if (
        this.authService.hasIncompleteProfileFlag() &&
        user.completeProfile !== true
      ) {
        this.router.navigate(['/complete-profile'], {
          queryParams: userId ? { userId } : undefined,
          replaceUrl: true,
        });
      } else {
        // Si estamos en raíz/home tras login exitoso, redirigir a destino.
        if (auth === 'success') {
          this.router.navigate([this.authService.getRedirectUrl()], {
            replaceUrl: true,
          });
        }
      }
      // Podemos desuscribir tras primera decisión.
      setTimeout(() => sub.unsubscribe(), 0);
    });

    // Si ya había usuario en localStorage sin auth=success, redirigir desde home.
    if (!auth && this.authService.isAuthenticated()) {
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
