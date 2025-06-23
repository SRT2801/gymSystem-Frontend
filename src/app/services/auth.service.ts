import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  documentId: string;
  birthDate: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    // Puedes añadir más campos según la respuesta de tu backend
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = environment.tokenKey;
  private readonly USER_KEY = environment.userKey;

  // BehaviorSubject para manejar el estado de autenticación
  private authStateSubject = new BehaviorSubject<boolean>(false);
  public authState$ = this.authStateSubject.asObservable();

  // BehaviorSubject para manejar la información del usuario
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // En un enfoque basado en cookies, debemos verificar la sesión con el backend
    // al inicializar el servicio
    // Nota: Este código está restaurado a su versión original
    this.checkSession().subscribe({
      next: () => {
        // La sesión está activa en el backend
      },
      error: () => {
        // Si falla, intentamos cargar datos del usuario desde localStorage
        // solo para mantener la UI actualizada hasta que se pueda verificar con el backend
        this.loadUserFromLocalStorage();
      },
    });
  }
  
  // Cargar datos del usuario desde localStorage (solo para UI)
  private loadUserFromLocalStorage(): void {
    const storedUser = localStorage.getItem(this.USER_KEY);
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.setCurrentUser(user);
      } catch (e) {
        localStorage.removeItem(this.USER_KEY);
        this.setCurrentUser(null);
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(tap((response) => {
        // En un enfoque basado en cookies, solo guardamos el usuario en localStorage
        // para mantener la UI actualizada, pero la autenticación real se maneja con cookies
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        this.setCurrentUser(response.user);
      }));
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(tap((response) => {
        // En un enfoque basado en cookies, solo guardamos el usuario en localStorage
        // para mantener la UI actualizada
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        this.setCurrentUser(response.user);
      }));
  }
  
  // Actualiza el estado de autenticación y la información del usuario
  private setCurrentUser(user: any): void {
    this.currentUserSubject.next(user);
    this.authStateSubject.next(!!user);
  }

  // Obtener la información del usuario logueado
  getUser(): any {
    return this.currentUserSubject.getValue();
  }

  // Verificar si hay una sesión activa
  checkSession(): Observable<any> {
    return this.http
      .get<any>(`${this.API_URL}/auth/me`)
      .pipe(tap((user) => {
        // Guardar los datos del usuario en localStorage para mantener la UI actualizada
        // cuando se recargue la página
        if (user) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
        this.setCurrentUser(user);
      }));
  }

  // Comprobar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.getValue();
  }

  // Cerrar sesión
  logout(): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/logout`, {}).pipe(
      tap(() => {
        // Limpiar datos de localStorage (solo para UI)
        localStorage.removeItem(this.USER_KEY);
        // Actualizar estado
        this.setCurrentUser(null);
      })
    );
  }
}
