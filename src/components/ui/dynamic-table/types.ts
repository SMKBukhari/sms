import { ReactNode } from "react";

export type ColumnAlignment = "left" | "center" | "right";

export interface TableColumn<T> {
  id: string;
  label: string | ReactNode;
  render?: (row: T) => ReactNode; // Custom renderer if not just row[id]
  width?: string; // e.g., "100px", "20%"
  align?: ColumnAlignment;
  sortable?: boolean;
  hideOnMobile?: boolean; // Responsive helper
  sticky?: "left" | "right" | "none"; // Sticky columns
  stickyHeader?: boolean; // Default should probably be true for table
}

export interface TableAction<T> {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  onClick: (row: T) => void;
  show?: (row: T) => boolean; // Logic to show/hide action per row
}

export interface BulkAction<T> {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary";
  onClick: (selectedRows: T[]) => void;
}

export interface DynamicTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  bulkActions?: BulkAction<T>[];
  keyField: keyof T; // Unique identifier field (e.g., "id")

  // Selection
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  selectedRows?: T[]; // Controlled selection state

  // Pagination (handled externally mainly, but we might render footer)
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;

  // Sorting
  onSort?: (columnId: string, direction: "asc" | "desc") => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";

  // State
  isLoading?: boolean;
  emptyState?: ReactNode;

  className?: string;
}
