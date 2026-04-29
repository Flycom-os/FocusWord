'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface SelectionOptions {
  items: any[];
  getItemId: (item: any) => string | number;
  onSelectionChange?: (selectedIds: Set<string | number>) => void;
}

export const useTableSelection = ({ items, getItemId, onSelectionChange }: SelectionOptions) => {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Notify parent component when selection changes
  useEffect(() => {
    onSelectionChange?.(selectedIds);
  }, [selectedIds, onSelectionChange]);

  // Get index of item by id
  const getItemIndex = useCallback((id: string | number) => {
    return items.findIndex(item => getItemId(item) === id);
  }, [items, getItemId]);

  // Toggle selection of single item
  const toggleSelection = useCallback((id: string | number, event?: React.MouseEvent) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });

    // Update last selected index
    const index = getItemIndex(id);
    setLastSelectedIndex(index);
    setFocusedIndex(index);
  }, [getItemIndex]);

  // Select single item (clear others)
  const selectSingle = useCallback((id: string | number, event?: React.MouseEvent) => {
    setSelectedIds(new Set([id]));
    const index = getItemIndex(id);
    setLastSelectedIndex(index);
    setFocusedIndex(index);
  }, [getItemIndex]);

  // Select range of items (Shift + Click)
  const selectRange = useCallback((id: string | number, event: React.MouseEvent) => {
    if (lastSelectedIndex === null) {
      selectSingle(id, event);
      return;
    }

    const currentIndex = getItemIndex(id);
    const startIndex = Math.min(lastSelectedIndex, currentIndex);
    const endIndex = Math.max(lastSelectedIndex, currentIndex);

    const newSelection = new Set<string | number>();
    for (let i = startIndex; i <= endIndex; i++) {
      if (items[i]) {
        newSelection.add(getItemId(items[i]));
      }
    }

    setSelectedIds(newSelection);
    setFocusedIndex(currentIndex);
  }, [lastSelectedIndex, getItemIndex, items, selectSingle]);

  // Handle click on row
  const handleRowClick = useCallback((id: string | number, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedIndex !== null) {
      selectRange(id, event);
    } else if (event.ctrlKey || event.metaKey) {
      toggleSelection(id, event);
    } else {
      selectSingle(id, event);
    }
  }, [lastSelectedIndex, selectRange, toggleSelection, selectSingle]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!tableRef.current || focusedIndex === null) return;

    const isShiftPressed = event.shiftKey;
    let newIndex = focusedIndex;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        newIndex = Math.max(0, focusedIndex - 1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        newIndex = Math.min(items.length - 1, focusedIndex + 1);
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      case ' ':
        event.preventDefault();
        if (items[focusedIndex]) {
          const id = getItemId(items[focusedIndex]);
          if (isShiftPressed && lastSelectedIndex !== null) {
            selectRange(id, event as any);
          } else {
            toggleSelection(id);
          }
        }
        return;
      case 'a':
      case 'A':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          setSelectedIds(new Set(items.map(item => getItemId(item))));
          return;
        }
        break;
      case 'Escape':
        event.preventDefault();
        setSelectedIds(new Set());
        setLastSelectedIndex(null);
        return;
      default:
        return;
    }

    if (newIndex !== focusedIndex && items[newIndex]) {
      setFocusedIndex(newIndex);
      
      // If Shift is pressed, extend selection
      if (isShiftPressed && lastSelectedIndex !== null) {
        const id = getItemId(items[newIndex]);
        selectRange(id, event as any);
      } else if (!isShiftPressed) {
        // Move focus without changing selection unless it's a space key
        const id = getItemId(items[newIndex]);
        if (!event.shiftKey) {
          selectSingle(id);
        }
      }
    }
  }, [focusedIndex, items, getItemId, lastSelectedIndex, selectRange, toggleSelection, selectSingle]);

  // Select all items
  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(item => getItemId(item))));
  }, [items, getItemId]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedIndex(null);
    setFocusedIndex(null);
  }, []);

  // Check if item is selected
  const isSelected = useCallback((id: string | number) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  // Check if all items are selected
  const isAllSelected = useCallback(() => {
    return items.length > 0 && selectedIds.size === items.length;
  }, [items.length, selectedIds.size]);

  // Check if some items are selected (but not all)
  const isPartiallySelected = useCallback(() => {
    return selectedIds.size > 0 && selectedIds.size < items.length;
  }, [selectedIds.size, items.length]);

  // Get selected items
  const getSelectedItems = useCallback(() => {
    return items.filter(item => selectedIds.has(getItemId(item)));
  }, [items, selectedIds, getItemId]);

  // Set up keyboard event listener
  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    table.addEventListener('keydown', handleKeyDown);
    return () => {
      table.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    selectedIds,
    focusedIndex,
    tableRef,
    isSelected,
    isAllSelected,
    isPartiallySelected,
    getSelectedItems,
    handleRowClick,
    toggleSelection,
    selectSingle,
    selectRange,
    selectAll,
    clearSelection,
  };
};
