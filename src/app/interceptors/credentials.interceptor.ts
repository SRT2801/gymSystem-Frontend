import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class CredentialsInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const authReq = req.clone({
      withCredentials: true,
    });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          if (
            !this.router.url.includes('/login') &&
            !req.url.includes('/auth/logout') &&
            !req.url.includes('/auth/login')
          ) {
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 100);
          }
        }

        return throwError(() => error);
      })
    );
  }
}
