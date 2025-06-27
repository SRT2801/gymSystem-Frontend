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
  activeFilter: string = ''; // '' = todos, 'true' = activos, 'false' = inactivos
  sortField?: string;
  sortDirection?: string;

  // Variables para el modal de edición
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

  // Crear el formulario para miembros
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
      // No incluimos registrationDate en el formulario ya que es solo informativo y su formato es distinto (incluye hora)
      active: [member?.active !== undefined ? member.active : true],
      hasAccount: [member?.hasAccount || false],
    });
  }

  // Formatear fecha para el input de tipo date (YYYY-MM-DD)
  formatDateForInput(dateString: string): string {
    if (!dateString) return '';

    try {
      // Detectar el formato de la fecha
      if (dateString.includes('/')) {
        // Formato "DD/MM/YYYY" o "DD/MM/YYYY HH:mm"
        const parts = dateString.split(' ')[0].split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Los meses en JS son 0-indexados
          const year = parseInt(parts[2], 10);

          // Crear fecha con los componentes
          const date = new Date(year, month, day);

          // Verificar si la fecha es válida
          if (isNaN(date.getTime())) {
            return '';
          }

          // Formatear como YYYY-MM-DD para el input
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');

          return `${yyyy}-${mm}-${dd}`;
        }
      } else {
        // Otros formatos, intentar con el constructor de Date estándar
        const date = new Date(dateString);

        // Verificar si la fecha es válida
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
    // Si solo tenemos datos parciales del miembro, obtener los detalles completos
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
          // Si falla la obtención de datos detallados, intentamos con los datos que ya tenemos
          this.selectedMember = member;
          this.memberForm = this.createMemberForm(member);
          this.isEditModalOpen = true;
        },
        complete: () => {
          this.loading = false;
        },
      });
    } else {
      // Si ya tenemos todos los datos necesarios
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

    // Obtenemos los valores del formulario
    const formValues = this.memberForm.value;

    // Crear un objeto para enviar al backend
    const memberToUpdate: any = {
      ...formValues,
      // Eliminar la fecha de nacimiento del objeto inicial
      // La añadiremos correctamente después
      birthDate: undefined,
    };

    // Si tenemos una fecha de nacimiento válida en el formulario
    if (formValues.birthDate) {
      try {
        // Convertir de YYYY-MM-DD (formato del input) a objeto Date de JavaScript
        // MongoDB/Mongoose puede manejar objetos Date nativos de JavaScript
        const dateParts = formValues.birthDate.split('-');
        if (dateParts.length === 3) {
          const year = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1; // Los meses en JS son 0-indexados
          const day = parseInt(dateParts[2], 10);

          // Crear un objeto Date que MongoDB pueda usar
          const birthDate = new Date(year, month, day);

          // Verificar que la fecha sea válida
          if (!isNaN(birthDate.getTime())) {
            // Usar la fecha como objeto Date, no como string
            memberToUpdate.birthDate = birthDate;
          }
        }
      } catch (error) {
        // Silenciar error
      }
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
}
