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
  @Input() data: any[] = []; // Datos a mostrar en la tabla
  @Input() config: TableConfig = { columns: [] }; // Configuración de la tabla
  @Input() loading: boolean = false; // Indicador de carga
  @Input() totalRecords: number = 0; // Total de registros para paginación
  @Input() actions: TableAction[] = []; // Acciones disponibles
  @Input() customTemplates: { [key: string]: TemplateRef<any> } = {}; // Templates personalizados

  @Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>(); // Evento al cambiar de página o tamaño
  @Output() sortChange = new EventEmitter<any>(); // Evento al ordenar
  @Output() rowSelect = new EventEmitter<any>(); // Evento al seleccionar fila
  @Output() rowAction = new EventEmitter<{ action: string; item: any }>(); // Evento para acción en fila

  currentPage: number = 1;
  pageSize: number = 10;
  selectedRows: any[] = [];
  currentSort: { field: string; direction: 'asc' | 'desc' } | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    // Resetear selección cuando cambian los datos
    if (changes['data']) {
      this.selectedRows = [];
    }
  }

  /**
   * Ordena los datos por columna
   * @param column Columna por la cual ordenar
   */
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
  /**
   * Cambia de página
   * @param page Número de página
   */
  changePage(page: number): void {
    this.currentPage = page;
    this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
  }

  /**
   * Cambia el tamaño de página y recalcula la página actual
   */ onPageSizeChange(): void {
    // Calcular la posición del primer registro en la página actual
    const firstRecord = (this.currentPage - 1) * this.pageSize + 1;

    // Calcular la nueva página que contendría ese registro
    this.currentPage = Math.floor((firstRecord - 1) / this.pageSize) + 1;

    // Emitir el evento con la nueva página y el nuevo tamaño
    this.pageChange.emit({
      page: this.currentPage,
      pageSize: parseInt(this.pageSize.toString()),
    });
  }

  /**
   * Verifica si una acción debería mostrarse para un elemento específico
   * @param action La acción a verificar
   * @param item El elemento de datos
   * @returns boolean indicando si debe mostrarse
   */
  shouldShowAction(action: TableAction, item: any): boolean {
    if (!action.showIf) return true;
    return action.showIf(item);
  }

  /**
   * Ejecuta una acción en un elemento
   * @param action La acción a ejecutar
   * @param item El elemento sobre el que actuar
   */
  executeAction(action: TableAction, item: any): void {
    action.action(item);
    this.rowAction.emit({ action: action.label, item });
  }

  /**
   * Selecciona o deselecciona una fila
   * @param item El elemento a seleccionar/deseleccionar
   * @param event El evento del checkbox
   */
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

  /**
   * Devuelve el valor de un campo usando notación de punto
   * @param item El objeto de datos
   * @param field El campo a obtener (puede ser anidado con notación de punto)
   * @returns El valor del campo
   */
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

  /**
   * Determina la clase CSS para una fila
   * @param item El elemento de datos
   * @returns String de clases CSS
   */
  getRowClass(item: any): string {
    if (this.config.rowClass) {
      return this.config.rowClass(item);
    }
    return '';
  }

  /**
   * Verifica si todas las filas están seleccionadas
   * @returns boolean indicando si todas las filas están seleccionadas
   */
  areAllSelected(): boolean {
    return (
      this.data.length > 0 && this.selectedRows.length === this.data.length
    );
  }

  /**
   * Selecciona o deselecciona todas las filas
   * @param event El evento del checkbox
   */
  toggleAllRows(event: any): void {
    const isChecked = event.target.checked;

    if (isChecked) {
      this.selectedRows = [...this.data];
    } else {
      this.selectedRows = [];
    }

    this.rowSelect.emit(this.selectedRows);
  }

  /**
   * Calcula la cantidad de páginas para la paginación
   * @returns El número de páginas
   */
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  /**
   * Genera un array para la paginación
   * @returns Array con los números de página a mostrar
   */
  get pages(): number[] {
    const totalPages = this.totalPages;

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Mostrar primera página, página actual y alrededor, y última página
    const pages = [1];

    const startPage = Math.max(2, this.currentPage - 1);
    const endPage = Math.min(totalPages - 1, this.currentPage + 1);

    if (startPage > 2) {
      pages.push(-1); // Indicador de "..."
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push(-1); // Indicador de "..."
    }

    pages.push(totalPages);

    return pages;
  }
}
