export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  documentId: string;
  birthDate: string;
  registrationDate: string;
  active: boolean;
  hasAccount: boolean;
}

export interface MemberResponse {
  message: string;
  data: Member[];
  pagination: Pagination;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
