import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { AdminComponent } from './pages/admin/admin';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';
import { AuthenticatedLayoutComponent } from './layouts/authenticated-layout/authenticated-layout';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },


  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: 'home', component: Home },
      { path: 'login', component: Login },
      { path: 'register', component: Register },
    ],
  },


  {
    path: '',
    component: AuthenticatedLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'admin',
        component: AdminComponent,
        canActivate: [AdminGuard],
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile').then((m) => m.ProfileComponent),
      },

    ],
  },

  { path: '**', redirectTo: '', pathMatch: 'full' },
];
