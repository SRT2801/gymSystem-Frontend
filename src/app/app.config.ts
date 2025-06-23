import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  withXsrfConfiguration,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { CredentialsInterceptor } from './interceptors/credentials.interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withViewTransitions({
        onViewTransitionCreated: () => {
          // Forzar el scroll al inicio en cada navegación
          window.scrollTo(0, 0);
        },
      })
    ),
    // Configuración para que todas las solicitudes HTTP envíen cookies
    provideHttpClient(
      withInterceptorsFromDi(),
      withXsrfConfiguration({
        // Protección CSRF (opcional pero recomendado)
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      })
    ),
    // Registrando el interceptor para todas las solicitudes HTTP
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CredentialsInterceptor,
      multi: true,
    },
  ],
};
