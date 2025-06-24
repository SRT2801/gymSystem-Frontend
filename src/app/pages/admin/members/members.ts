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

  tableConfig: TableConfig = {
    columns: [],
    pagination: true,
    sortable: true,
    selectable: true,
    actionColumn: true,
    rowClass: (item: Member) => (item.active ? '' : 'inactive'),
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

    this.memberService.getMembers(this.currentPage, this.pageSize).subscribe({
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
  /**
   * Maneja el cambio de página o tamaño de página
   * @param pageEvent Evento con página y tamaño
   */
  onPageChange(pageEvent: { page: number; pageSize: number }): void {
    this.currentPage = pageEvent.page;
    this.pageSize = pageEvent.pageSize;
    this.loadMembers();
  }

  /**
   * Maneja el cambio de ordenamiento
   * @param sort Información de ordenamiento
   */
  onSortChange(sort: any): void {
    // Aquí se implementaría el ordenamiento
    // Por ahora solo recargamos los datos
    this.loadMembers();
  }

  /**
   * Ver detalles de un miembro
   * @param member Miembro a ver
   */
  viewMember(member: Member): void {
    console.log('Ver miembro:', member);
    // Aquí se implementaría la navegación a la vista detallada
  }

  /**
   * Editar un miembro
   * @param member Miembro a editar
   */
  editMember(member: Member): void {
    console.log('Editar miembro:', member);
    // Aquí se implementaría la navegación al formulario de edición
  }

  /**
   * Cambiar el estado de un miembro
   * @param member Miembro a cambiar estado
   */
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

  /**
   * Eliminar un miembro
   * @param member Miembro a eliminar
   */
  deleteMember(member: Member): void {
    if (confirm(`¿Estás seguro de eliminar al miembro ${member.name}?`)) {
      this.loading = true;

      this.memberService.deleteMember(member.id).subscribe({
        next: () => {
          this.loadMembers(); // Recargar la lista
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
