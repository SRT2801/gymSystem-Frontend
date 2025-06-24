import { Injectable } from '@angular/core';
import { TableAction, TableColumn } from '../models/table.model';

@Injectable({
  providedIn: 'root',
})
export class TableService {
  getCommonActions(): { [key: string]: TableAction } {
    return {
      view: {
        icon: 'fa fa-eye',
        label: 'Ver',
        color: 'info',
        action: () => {},
      },
      edit: {
        icon: 'fa fa-edit',
        label: 'Editar',
        color: 'primary',
        action: () => {},
      },
      delete: {
        icon: 'fa fa-trash',
        label: 'Eliminar',
        color: 'danger',
        action: () => {},
      },
      activate: {
        icon: 'fa fa-toggle-off',
        label: 'Activar',
        color: 'danger',
        showIf: (item: any) => !item.active,
        action: () => {},
      },
      deactivate: {
        icon: 'fa fa-toggle-on',
        label: 'Desactivar',
        color: 'success',
        showIf: (item: any) => item.active,
        action: () => {},
      },
    };
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    try {
      const parts = dateString.split(' ');
      return parts[0];
    } catch (error) {
      return dateString;
    }
  }

  formatBoolean(
    value: boolean,
    trueText: string = 'Sí',
    falseText: string = 'No'
  ): string {
    return value ? trueText : falseText;
  }

  formatActiveStatus(value: boolean): string {
    return value ? 'Activo' : 'Inactivo';
  }

  getMembersTableColumns(): TableColumn[] {
    return [
      { header: 'Nombre', field: 'name', sortable: true },
      { header: 'Email', field: 'email', sortable: true },
      { header: 'Teléfono', field: 'phone', sortable: false },
      { header: 'Documento', field: 'documentId', sortable: true },
      { header: 'Fecha Registro', field: 'registrationDate', sortable: true },
      {
        header: 'Estado',
        field: 'active',
        sortable: true,
        template: 'statusTemplate',
      },
    ];
  }
}
