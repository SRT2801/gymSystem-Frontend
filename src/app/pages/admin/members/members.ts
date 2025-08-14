import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../components/table/table';
import { MemberService } from '../../../services/member.service';
import { TableService } from '../../../services/table.service';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Member } from '../../../models/member.model';
import { TableAction, TableConfig } from '../../../models/table.model';
import { ModalComponent } from '../../../components/modal/modal';
import { Boton } from '../../../components/boton/boton';
import { SearchbarComponent } from '../../../components/searchbar/searchbar';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableComponent,
    ModalComponent,
    Boton,
    SearchbarComponent,
  ],
  templateUrl: './members.html',
  styleUrls: ['./members.scss'],
})
export class MembersComponent implements OnInit {
  @ViewChild('statusTemplate', { static: true })
  statusTemplate!: TemplateRef<any>;

  members: Member[] = [];
  loading: boolean = true;
  totalRecords: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  activeFilter: string = '';
  sortField: string = 'documentId';
  sortDirection: string = 'asc';
  searchTerm: string = '';

  isEditModalOpen: boolean = false;
  selectedMember: Member | null = null;
  memberForm: FormGroup;

  tableConfig: TableConfig = {
    columns: [],
    pagination: true,
    sortable: true,
    selectable: true,
    actionColumn: true,
    rowClass: (item: Member) => (item.active ? 'row-active' : 'row-inactive'),
  };

  tableActions: TableAction[] = [];

  customTemplates: { [key: string]: TemplateRef<any> } = {};

  constructor(
    private memberService: MemberService,
    private tableService: TableService,
    private fb: FormBuilder
  ) {
    this.memberForm = this.createMemberForm();
  }

  ngOnInit(): void {
    this.tableConfig.columns = this.tableService.getMembersTableColumns();

    this.setupTableActions();
    this.sortField = 'documentId';
    this.sortDirection = 'asc';

    this.loadMembers();
  }

  ngAfterViewInit() {
    this.customTemplates = {
      statusTemplate: this.statusTemplate,
    };
  }

  loadMembers(): void {
    this.loading = true;

    let activeBoolean: boolean | undefined;
    if (this.activeFilter === 'true') activeBoolean = true;
    else if (this.activeFilter === 'false') activeBoolean = false;

    const searchParams: any = {};

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const trimmedTerm = this.searchTerm.trim();
      const isNumeric = /^\d+$/.test(trimmedTerm);

      if (isNumeric || trimmedTerm.length >= 3) {
        if (trimmedTerm.includes('@')) {
          searchParams.email = trimmedTerm;
        } else if (isNumeric) {
          searchParams.documentId = trimmedTerm;
        } else {
          searchParams.name = trimmedTerm;
        }
      }
    }

    this.memberService
      .getMembers(
        this.currentPage,
        this.pageSize,
        activeBoolean,
        this.sortField,
        this.sortDirection,
        searchParams
      )
      .subscribe({
        next: (response) => {
          this.members = response.data;
          this.totalRecords = response.pagination.total;
        },
        error: (error) => {
          console.error('Error al cargar miembros:', error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  createMemberForm(member?: Member): FormGroup {
    let formattedBirthDate = '';

    if (member?.birthDate) {
      formattedBirthDate = this.formatDateForInput(member.birthDate);
    }

    return this.fb.group({
      name: [member?.name || '', [Validators.required]],
      email: [member?.email || '', [Validators.required, Validators.email]],
      phone: [member?.phone || ''],
      documentId: [member?.documentId || ''],
      birthDate: [formattedBirthDate],
      active: [member?.active !== undefined ? member.active : true],
      hasAccount: [member?.hasAccount || false],
    });
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';

    try {
      if (dateString.includes('/')) {
        const parts = dateString.split(' ')[0].split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);

          const date = new Date(year, month, day);

          if (isNaN(date.getTime())) {
            return '';
          }

          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');

          return `${yyyy}-${mm}-${dd}`;
        }
      } else {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
          return '';
        }

        return date.toISOString().split('T')[0];
      }

      return '';
    } catch (error) {
      return '';
    }
  }

  setupTableActions(): void {
    const commonActions = this.tableService.getCommonActions();

    this.tableActions = [
      {
        ...commonActions['view'],
        action: (item: Member) => this.viewMember(item),
      },
      {
        ...commonActions['edit'],
        action: (item: Member) => this.editMember(item),
      },
      {
        ...commonActions['activate'],
        action: (item: Member) => this.toggleStatus(item),
      },
      {
        ...commonActions['deactivate'],
        action: (item: Member) => this.toggleStatus(item),
      },
      {
        ...commonActions['delete'],
        action: (item: Member) => this.deleteMember(item),
      },
    ];
  }

  onPageChange(pageEvent: { page: number; pageSize: number }): void {
    this.currentPage = pageEvent.page;
    this.pageSize = pageEvent.pageSize;
    this.loadMembers();
  }

  onSortChange(sort: { field: string; direction: 'asc' | 'desc' }): void {
    this.sortField = sort.field;
    this.sortDirection = sort.direction;
    this.loadMembers();
  }

  onFilterChange(filter: string): void {
    this.activeFilter = filter;
    this.currentPage = 1;
    this.loadMembers();
  }

  onSearch(searchTerm: string): void {
    if (searchTerm.trim() === '' || searchTerm.trim().length >= 3) {
      this.searchTerm = searchTerm;
      this.currentPage = 1;
      this.loadMembers();
    } else if (searchTerm.trim().length < 3) {
      this.searchTerm = searchTerm;
    }
  }

  onClearSearch(): void {
    this.searchTerm = '';
    this.loadMembers();
  }

  shouldShowMinLengthWarning(): boolean {
    if (!this.searchTerm) return false;
    const trimmed = this.searchTerm.trim();
    if (trimmed.length === 0) return false;
    if (trimmed.length >= 3) return false;
    if (/^\d+$/.test(trimmed)) return false;
    return true;
  }

  isNumeric(value: string): boolean {
    return /^\d+$/.test(value.trim());
  }

  viewMember(member: Member): void {
    console.log('Ver miembro:', member);
  }

  editMember(member: Member): void {
    if (!member.birthDate || !member.registrationDate) {
      this.loading = true;
      this.memberService.getMemberById(member.id).subscribe({
        next: (response) => {
          this.selectedMember = response.data;
          this.memberForm = this.createMemberForm(response.data);
          this.isEditModalOpen = true;
        },
        error: (error) => {
          this.loading = false;
          this.selectedMember = member;
          this.memberForm = this.createMemberForm(member);
          this.isEditModalOpen = true;
        },
        complete: () => {
          this.loading = false;
        },
      });
    } else {
      this.selectedMember = member;
      this.memberForm = this.createMemberForm(member);
      this.isEditModalOpen = true;
    }
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedMember = null;
  }

  saveMember(): void {
    if (
      this.memberForm.invalid ||
      !this.selectedMember ||
      !this.memberForm.dirty
    )
      return;

    this.loading = true;

    const formValues = this.memberForm.value;

    const memberToUpdate: any = {
      ...formValues,
      birthDate: undefined,
    };

    if (formValues.birthDate) {
      try {
        const dateParts = formValues.birthDate.split('-');
        if (dateParts.length === 3) {
          const year = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1;
          const day = parseInt(dateParts[2], 10);

          const birthDate = new Date(year, month, day);

          if (!isNaN(birthDate.getTime())) {
            memberToUpdate.birthDate = birthDate;
          }
        }
      } catch (error) {}
    }

    this.memberService
      .updateMember(this.selectedMember.id, memberToUpdate)
      .subscribe({
        next: (response) => {
          this.closeEditModal();
          this.loadMembers();
        },
        error: (error) => {
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  toggleStatus(member: Member): void {
    this.loading = true;

    this.memberService.changeStatus(member.id, !member.active).subscribe({
      next: () => {
        member.active = !member.active;
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  deleteMember(member: Member): void {
    if (confirm(`¿Estás seguro de eliminar al miembro ${member.name}?`)) {
      this.loading = true;

      this.memberService.deleteMember(member.id).subscribe({
        next: () => {
          this.loadMembers();
        },
        error: (error) => {
          console.error('Error al eliminar miembro:', error);
        },
        complete: () => {
          this.loading = false;
        },
      });
    }
  }

  onImageError(event: any): void {
    // Ocultar la imagen y mostrar el ícono por defecto
    event.target.style.display = 'none';
  }
}
