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
    sortDirection?: string,
    searchParams: {
      name?: string;
      email?: string;
      documentId?: string;
      hasAccount?: boolean;
      registrationDateFrom?: string;
      registrationDateTo?: string;
    } = {}
  ): Observable<MemberResponse> {
    let url = `${this.apiUrl}/members?page=${page}&limit=${limit}`;

    if (active !== undefined) {
      url += `&active=${active}`;
    }

    if (sortField && sortDirection) {
      url += `&sortBy=${sortField}&sortOrder=${sortDirection}`;
    }

    if (searchParams.name) {
      url += `&name=${encodeURIComponent(searchParams.name)}`;
    }

    if (searchParams.email) {
      url += `&email=${encodeURIComponent(searchParams.email)}`;
    }

    if (searchParams.documentId) {
      url += `&documentId=${encodeURIComponent(searchParams.documentId)}`;
    }

    if (searchParams.hasAccount !== undefined) {
      url += `&hasAccount=${searchParams.hasAccount}`;
    }

    if (searchParams.registrationDateFrom) {
      url += `&registrationDateFrom=${searchParams.registrationDateFrom}`;
    }

    if (searchParams.registrationDateTo) {
      url += `&registrationDateTo=${searchParams.registrationDateTo}`;
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
