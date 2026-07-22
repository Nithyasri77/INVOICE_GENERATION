/**
 * Purpose: Boolean open/close state helper for Modal, Drawer, Popover triggers
 * Responsibilities: Provide isOpen + open/close/toggle handlers so pages don't repeat useState boilerplate
 * Dependencies: react
 * Export: useDisclosure()
 */
import { useCallback, useState } from 'react';

export interface UseDisclosureReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useDisclosure(initial = false): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(initial);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}
