export interface TableColumn {
  header: string;
  field: string;
  sortable?: boolean;
  width?: string;
  template?: string;
  class?: string;
}

export interface TableConfig {
  columns: TableColumn[];
  selectable?: boolean;
  pagination?: boolean;
  sortable?: boolean;
  actionColumn?: boolean;
  rowClass?: (data: any) => string;
}

export interface TableAction {
  icon: string;
  label: string;
  action: Function;
  color?: string;
  showIf?: (data: any) => boolean; 
}
