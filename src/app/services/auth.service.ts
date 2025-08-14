import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  BehaviorSubject,
  of,
  throwError,
  ReplaySubject,
} from 'rxjs';
import { tap, catchError, finalize, share } from 'rxjs/operators';
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
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly USER_KEY = environment.userKey;

  private sessionCheckInProgress = false;

  private sessionCheckObs: Observable<any> | null = null;

  private authStateSubject = new BehaviorSubject<boolean>(false);
  public authState$ = this.authStateSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  constructor(private http: HttpClient) {
    this.loadUserFromLocalStorage();
  }

  private incompleteProfileFlagKey = 'incomplete_profile_flag';

  setIncompleteProfileFlag(value: boolean) {
    if (value) {
      localStorage.setItem(this.incompleteProfileFlagKey, 'true');
    } else {
      localStorage.removeItem(this.incompleteProfileFlagKey);
    }
  }

  hasIncompleteProfileFlag(): boolean {
    return localStorage.getItem(this.incompleteProfileFlagKey) === 'true';
  }
  verifySessionWithBackend(): void {
    if (this.sessionCheckInProgress) return;

    this.sessionCheckInProgress = true;

    this.checkSession().subscribe({
      next: (user) => {
        if (user && user.name && user.id) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          this.setCurrentUser(user);
        }
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.clearUserData();
        }
      },
      complete: () => {
        this.sessionCheckInProgress = false;
        this.sessionCheckObs = null;
      },
    });
  }
  private loadUserFromLocalStorage(): void {
    try {
      const storedUser = localStorage.getItem(this.USER_KEY);
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user && user.name) {
          this.setCurrentUser(user);
        }
      }
    } catch (error) {
      this.clearUserData();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          const user = (response as any)?.user || response;
          if (user && user.id) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
            this.setCurrentUser(user);
          }
        })
      );
  }
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        tap((response) => {
          const user = (response as any)?.user || response;
          if (user && user.id) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
            this.setCurrentUser(user);
          }
        }),
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  private setCurrentUser(user: any): void {
    if (!user) return;

    this.currentUserSubject.next(user);
    this.authStateSubject.next(true);

    if (user.completeProfile === true) {
      this.setIncompleteProfileFlag(false);
    }
  }

  getUser(): any {
    return this.currentUserSubject.getValue();
  }

  checkSession(): Observable<any> {
    if (this.sessionCheckObs) {
      return this.sessionCheckObs;
    }

    this.sessionCheckObs = this.http.get<any>(`${this.API_URL}/auth/me`).pipe(
      tap((resp) => {
        const user = resp?.user || resp; // backend devuelve { user: {...} }
        if (user && user.name && user.id) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          this.setCurrentUser(user);
        }
      }),
      catchError((error) => {
        if (error.status === 401 || error.status === 403) {
          this.clearUserData();
        }
        return throwError(() => error);
      }),
      finalize(() => {
        this.sessionCheckInProgress = false;
        this.sessionCheckObs = null;
      }),
      share()
    );

    return this.sessionCheckObs;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.getValue();
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.getValue();
    return user && user.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  getRedirectUrl(): string {
    const user = this.currentUserSubject.getValue();
    if (!user) return '/home';

    switch (user.role) {
      case 'admin':
        return '/admin';
      default:
        return '/home';
    }
  }

  private clearUserData(): void {
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.authStateSubject.next(false);
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/logout`, {}).pipe(
      tap(() => {
        this.clearUserData();
      }),
      catchError((error) => {
        this.clearUserData();
        return of({ success: true });
      })
    );
  }

  completeProfile(data: {
    phone: string;
    documentId: string;
    birthDate: string;
  }): Observable<any> {
    return this.http
      .post<any>(`${this.API_URL}/auth/complete-profile`, data)
      .pipe(
        tap((resp) => {
          if (resp && resp.user) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(resp.user));
            this.setCurrentUser(resp.user);
            this.setIncompleteProfileFlag(false);
          }
        })
      );
  }
}
