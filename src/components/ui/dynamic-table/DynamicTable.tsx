"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicTableProps } from "./types";

export function DynamicTable<T extends Record<string, any>>({
  data,
  columns,
  actions,
  bulkActions,
  keyField,
  selectable = false,
  onSelectionChange,
  selectedRows: controlledSelectedRows,
  totalItems,
  currentPage,
  pageSize = 10,
  onPageChange,
  onSort,
  sortColumn,
  sortDirection,
  isLoading = false,
  emptyState,
  className,
}: DynamicTableProps<T>) {
  // Internal selection state if uncontrolled
  const [internalSelectedRows, setInternalSelectedRows] = useState<T[]>([]);

  const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : 0;

  const selectedRows = controlledSelectedRows ?? internalSelectedRows;

  const handleSelectionChange = (newSelection: T[]) => {
    if (controlledSelectedRows === undefined) {
      setInternalSelectedRows(newSelection);
    }
    onSelectionChange?.(newSelection);
  };

  const isAllSelected = useMemo(() => {
    return data.length > 0 && selectedRows.length === data.length;
  }, [data.length, selectedRows.length]);

  const isPartiallySelected = useMemo(() => {
    return selectedRows.length > 0 && selectedRows.length < data.length;
  }, [data.length, selectedRows.length]);

  const toggleAll = () => {
    if (isAllSelected) {
      handleSelectionChange([]);
    } else {
      handleSelectionChange(data);
    }
  };

  const toggleRow = (row: T) => {
    const isSelected = selectedRows.some((r) => r[keyField] === row[keyField]);
    let newSelection: T[];
    if (isSelected) {
      newSelection = selectedRows.filter((r) => r[keyField] !== row[keyField]);
    } else {
      newSelection = [...selectedRows, row];
    }
    handleSelectionChange(newSelection);
  };

  const handleSort = (colId: string) => {
    if (!onSort) return;

    if (sortColumn === colId) {
      // Toggle direction
      onSort(colId, sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New sort column, default ascending
      onSort(colId, "asc");
    }
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectable &&
          selectedRows.length > 0 &&
          bulkActions &&
          bulkActions.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className='flex items-center gap-2 p-2 bg-secondary/30 rounded-lg border border-border'
            >
              <span className='text-sm font-medium px-2'>
                {selectedRows.length} selected
              </span>
              <div className='h-4 w-px bg-border mx-2' />
              <div className='flex items-center gap-2'>
                {bulkActions.map((action) => (
                  <Button
                    key={action.id}
                    variant={action.variant || "outline"}
                    size='sm'
                    onClick={() => action.onClick(selectedRows)}
                    className='h-8 text-xs gap-2'
                  >
                    {action.icon && (
                      <span className='w-3 h-3'>{action.icon}</span>
                    )}
                    {action.label}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      <div className='rounded-lg border border-primary-border/60 bg-card overflow-hidden'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader className='bg-linear-to-r from-primary/2 to-primary/2 h-14 relative'>
              <TableRow className='hover:bg-transparent bg-transparent *:border-primary-border [&>:not(:last-child)]:border-r border-primary-border text-center'>
                {selectable && (
                  <TableHead className='px-4'>
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={toggleAll}
                      aria-label='Select all'
                      className={cn(
                        isPartiallySelected &&
                          // "data-[state=checked]:bg-primary/50",
                          "",
                      )}
                    />
                  </TableHead>
                )}
                {columns.map((col) => (
                  <TableHead
                    key={col.id}
                    className={cn(
                      "whitespace-nowrap transition-colors",
                      col.width && `w-[${col.width}]`,
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                      col.sortable &&
                        "cursor-pointer select-none hover:text-foreground",
                      col.hideOnMobile && "hidden md:table-cell",
                      col.sticky === "left" &&
                        "sticky left-0 z-10 shadow-[1px_0_0_0_var(--border)]",
                      col.sticky === "right" &&
                        "sticky right-0 z-10 shadow-[-1px_0_0_0_var(--border)]",
                    )}
                    onClick={() => col.sortable && handleSort(col.id)}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-1 font-semibold text-sm",
                        col.align === "center" && "justify-center",
                        col.align === "right" && "justify-end",
                      )}
                    >
                      {col.label}
                      {col.sortable && (
                        <div className='shrink-0'>
                          {sortColumn === col.id ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className='h-3 w-3' />
                            ) : (
                              <ArrowDown className='h-3 w-3' />
                            )
                          ) : (
                            <ArrowUpDown className='h-3 w-3 opacity-50' />
                          )}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
                {actions && (
                  <TableHead className='w-[50px] sticky right-0 z-10 shadow-[-1px_0_0_0_var(--border-primary-border)]'></TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading Skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow
                    key={i}
                    className='*:border-primary-border [&>:not(:last-child)]:border-r'
                  >
                    {selectable && (
                      <TableCell className='p-4'>
                        <Skeleton className='h-4 w-4 rounded' />
                      </TableCell>
                    )}
                    {columns.map((col, j) => (
                      <TableCell
                        key={j}
                        className={cn(
                          col.hideOnMobile && "hidden md:table-cell",
                        )}
                      >
                        <Skeleton className='h-4 w-full' />
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell>
                        <Skeleton className='h-8 w-8 rounded-full' />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                // Empty State
                <TableRow className='*:border-primary-border [&>:not(:last-child)]:border-r'>
                  <TableCell
                    colSpan={
                      columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)
                    }
                    className='h-24 text-center'
                  >
                    {emptyState || "No results."}
                  </TableCell>
                </TableRow>
              ) : (
                // Data Rows
                <AnimatePresence mode='popLayout'>
                  {data.map((row, index) => {
                    const isSelected = selectedRows.some(
                      (r) => r[keyField] === row[keyField],
                    );

                    return (
                      <motion.tr
                        key={row[keyField]}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className={cn(
                          "border-b transition-colors hover:bg-primary/10 data-[state=selected]:bg-primary/10 border-primary-border *:border-primary-border [&>:not(:last-child)]:border-r",
                          // Zebra striping if desired: index % 2 === 0 ? "bg-background" : "bg-muted/5"
                        )}
                        data-state={isSelected ? "selected" : undefined}
                        layoutId={row[keyField]}
                      >
                        {selectable && (
                          <TableCell className='p-4'>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleRow(row)}
                              aria-label='Select row'
                            />
                          </TableCell>
                        )}

                        {columns.map((col) => (
                          <TableCell
                            key={col.id}
                            className={cn(
                              "py-3 px-4 text-sm wrap-break-word whitespace-normal max-w-[320px]",
                              col.align === "center" && "text-center",
                              col.align === "right" && "text-right",
                              col.hideOnMobile && "hidden md:table-cell",
                              col.sticky === "left" &&
                                "sticky left-0 z-10 border-primary-border shadow-[1px_0_0_0_var(--border)] group-hover:bg-primary/10",
                              col.sticky === "right" &&
                                "sticky right-0 z-10 border-primary-border shadow-[-1px_0_0_0_var(--border)] group-hover:bg-primary/10",
                            )}
                          >
                            {col.render ? col.render(row) : row[col.id]}
                          </TableCell>
                        ))}

                        {actions && (
                          <TableCell className='sticky right-0 z-10 border-primary-border shadow-[-1px_0_0_0_var(--border)] group-hover:bg-primary/10'>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant='primary'
                                  size='icon'
                                  className='h-8 w-8'
                                >
                                  <MoreHorizontal className='h-4 w-4' />
                                  <span className='sr-only'>Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                {actions.map((action) => {
                                  if (action.show && !action.show(row))
                                    return null;
                                  return (
                                    <DropdownMenuItem
                                      key={action.id}
                                      onClick={() => action.onClick(row)}
                                      className={cn(
                                        action.variant === "destructive" &&
                                          "text-destructive focus:text-destructive",
                                      )}
                                    >
                                      {action.icon && (
                                        <span className='mr-2 h-4 w-4'>
                                          {action.icon}
                                        </span>
                                      )}
                                      {action.label}
                                    </DropdownMenuItem>
                                  );
                                })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Footer - Optional simplistic implementation */}
      {onPageChange && totalPages > 1 && (
        <div className='flex items-center justify-between py-2'>
          <div className='text-sm text-muted-foreground'>
            {totalItems
              ? `Showing ${(currentPage! - 1) * pageSize! + 1}-${Math.min(currentPage! * pageSize!, totalItems)} of ${totalItems}`
              : ""}
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(currentPage! - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(currentPage! + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
