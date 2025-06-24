import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../components/table/table';
import { MemberService } from '../../../services/member.service';
import { TableService } from '../../../services/table.service';
import { FormsModule } from '@angular/forms';
import { Member } from '../../../models/member.model';
import { TableAction, TableConfig } from '../../../models/table.model';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent],
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
  activeFilter: string = ''; // '' = todos, 'true' = activos, 'false' = inactivos
  sortField?: string;
  sortDirection?: string;
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
    private tableService: TableService
  ) {}

  ngOnInit(): void {
    this.tableConfig.columns = this.tableService.getMembersTableColumns();

    this.setupTableActions();

    this.loadMembers();
  }

  ngAfterViewInit() {
    this.customTemplates = {
      statusTemplate: this.statusTemplate,
    };
  }

  loadMembers(): void {
    this.loading = true;

    // Convertir el filtro de string a boolean o undefined
    let activeBoolean: boolean | undefined;
    if (this.activeFilter === 'true') activeBoolean = true;
    else if (this.activeFilter === 'false') activeBoolean = false;
    // Si es cadena vacía, no se aplica filtro (undefined)

    this.memberService
      .getMembers(
        this.currentPage,
        this.pageSize,
        activeBoolean,
        this.sortField,
        this.sortDirection
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
      // Combinar activate/deactivate en un solo botón de toggle
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

  onFilterChange(filterValue: string): void {
    this.activeFilter = filterValue;
    this.currentPage = 1; // Volver a la primera página al cambiar filtros
    this.loadMembers();
  }

  viewMember(member: Member): void {
    console.log('Ver miembro:', member);
  }

  editMember(member: Member): void {
    console.log('Editar miembro:', member);
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
}
