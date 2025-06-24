import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MemberResponse } from '../models/member.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMembers(page: number = 1, limit: number = 10): Observable<MemberResponse> {
    return this.http.get<MemberResponse>(
      `${this.apiUrl}/members?page=${page}&limit=${limit}`
    );
  }

  getMemberById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/members/${id}`);
  }

  createMember(memberData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/members`, memberData);
  }

  updateMember(id: string, memberData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/members/${id}`, memberData);
  }

  deleteMember(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/members/${id}`);
  }

  changeStatus(id: string, status: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/members/${id}`, {
      active: status,
    });
  }
}
