import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';

export function Modal({ title, children, busy, onClose }: { title: string; children: ReactNode; busy: boolean; onClose(): void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const opener = document.activeElement;
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);
  return (
    <dialog ref={ref} aria-labelledby="dialog-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
      <div className="dialog-header">
        <h2 id="dialog-title">{title}</h2>
        <button type="button" aria-label="Close dialog" onClick={onClose} disabled={busy}><Icon name="close" /></button>
      </div>
      {children}
    </dialog>
  );
}
