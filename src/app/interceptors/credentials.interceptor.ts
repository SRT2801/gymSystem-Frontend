import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CredentialsInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Para un enfoque basado en cookies, simplemente aseguramos
    // que withCredentials esté habilitado para todas las solicitudes
    const authReq = req.clone({
      withCredentials: true,
    });

    // Pass the cloned request to the next handler
    return next.handle(authReq);
  }
}
