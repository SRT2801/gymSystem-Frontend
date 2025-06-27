import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Member, MemberResponse } from '../models/member.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMembers(
    page: number = 1,
    limit: number = 10,
    active?: boolean,
    sortField?: string,
    sortDirection?: string
  ): Observable<MemberResponse> {
    let url = `${this.apiUrl}/members?page=${page}&limit=${limit}`;

    // Agregar filtro de activo/inactivo si se especifica
    if (active !== undefined) {
      url += `&active=${active}`;
    }

    // Agregar ordenamiento si se especifica
    if (sortField && sortDirection) {
      url += `&sort=${sortField}&order=${sortDirection}`;
    }

    return this.http.get<MemberResponse>(url);
  }

  getMemberById(id: string): Observable<{ message: string; data: Member }> {
    return this.http.get<{ message: string; data: Member }>(
      `${this.apiUrl}/members/${id}`
    );
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
