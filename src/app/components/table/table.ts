import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TableAction,
  TableColumn,
  TableConfig,
} from '../../models/table.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table.html',
  styleUrls: ['./table.scss'],
})
export class TableComponent implements OnChanges {
  @Input() data: any[] = [];
  @Input() config: TableConfig = { columns: [] };
  @Input() loading: boolean = false;
  @Input() totalRecords: number = 0;
  @Input() actions: TableAction[] = [];
  @Input() customTemplates: { [key: string]: TemplateRef<any> } = {};
  @Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();
  @Output() sortChange = new EventEmitter<any>();
  @Output() rowSelect = new EventEmitter<any>();
  @Output() rowAction = new EventEmitter<{ action: string; item: any }>();

  currentPage: number = 1;
  pageSize: number = 10;
  selectedRows: any[] = [];
  currentSort: { field: string; direction: 'asc' | 'desc' } | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.selectedRows = [];
    }
  }

  sort(column: TableColumn): void {
    if (!column.sortable) return;

    if (this.currentSort && this.currentSort.field === column.field) {
      this.currentSort.direction =
        this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort = { field: column.field, direction: 'asc' };
    }

    this.sortChange.emit(this.currentSort);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
  }

  onPageSizeChange(): void {
    const firstRecord = (this.currentPage - 1) * this.pageSize + 1;

    this.currentPage = Math.floor((firstRecord - 1) / this.pageSize) + 1;

    this.pageChange.emit({
      page: this.currentPage,
      pageSize: parseInt(this.pageSize.toString()),
    });
  }

  shouldShowAction(action: TableAction, item: any): boolean {
    if (!action.showIf) return true;
    return action.showIf(item);
  }

  executeAction(action: TableAction, item: any): void {
    action.action(item);
    this.rowAction.emit({ action: action.label, item });
  }

  toggleRowSelection(item: any, event: any): void {
    const isSelected = event.target.checked;

    if (isSelected) {
      this.selectedRows.push(item);
    } else {
      const index = this.selectedRows.findIndex((row) => row === item);
      if (index !== -1) {
        this.selectedRows.splice(index, 1);
      }
    }

    this.rowSelect.emit(this.selectedRows);
  }

  getFieldValue(item: any, field: string): any {
    if (!field) return '';

    const fields = field.split('.');
    let value = item;

    for (const f of fields) {
      if (value === null || value === undefined) return '';
      value = value[f];
    }

    return value;
  }

  getRowClass(item: any): string {
    if (this.config.rowClass) {
      return this.config.rowClass(item);
    }
    return '';
  }

  areAllSelected(): boolean {
    return (
      this.data.length > 0 && this.selectedRows.length === this.data.length
    );
  }

  toggleAllRows(event: any): void {
    const isChecked = event.target.checked;

    if (isChecked) {
      this.selectedRows = [...this.data];
    } else {
      this.selectedRows = [];
    }

    this.rowSelect.emit(this.selectedRows);
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get pages(): number[] {
    const totalPages = this.totalPages;

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [1];

    const startPage = Math.max(2, this.currentPage - 1);
    const endPage = Math.min(totalPages - 1, this.currentPage + 1);

    if (startPage > 2) {
      pages.push(-1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push(-1);
    }

    pages.push(totalPages);

    return pages;
  }

  /**
   * Filtra las acciones para evitar mostrar botones duplicados para activar/desactivar
   * @param item El ítem de la fila actual
   * @returns Lista de acciones únicas para este ítem
   */
  getUniqueActions(item: any): TableAction[] {
    // Filtrar acciones según el showIf
    const visibleActions = this.actions.filter((action) => {
      return !action.showIf || action.showIf(item);
    });

    // Eliminar acciones duplicadas (basadas en la misma funcionalidad)
    // Solo mantener una acción entre 'activate'/'deactivate' basada en el estado del ítem
    const uniqueActions: TableAction[] = [];
    const handledFunctions = new Set<string>();

    visibleActions.forEach((action) => {
      // Para controles de toggle de estado (activate/deactivate), solo mostrar uno
      if (action.label === 'Activar' || action.label === 'Desactivar') {
        const toggleKey = 'toggle-status';
        if (!handledFunctions.has(toggleKey)) {
          handledFunctions.add(toggleKey);
          uniqueActions.push(action);
        }
      } else {
        // Para otras acciones, mantener todas
        uniqueActions.push(action);
      }
    });

    return uniqueActions;
  }
}
