import { useState } from 'react';
import type { Task } from '../api/types';
import { errorMessage } from '../board';
import { Modal } from './Modal';

export function DeleteDialog({ task, busy, onDelete, onClose }: { task: Task; busy: boolean; onDelete(id: string): Promise<void>; onClose(): void }) {
  const [error, setError] = useState('');
  async function remove() {
    setError('');
    try { await onDelete(task.id); onClose(); }
    catch (cause) { setError(errorMessage(cause)); }
  }
  return (
    <Modal title="Delete this task?" busy={busy} onClose={onClose}>
      <div className="confirmation">
        <p><strong>{task.title}</strong> will be removed from your board. This can’t be undone.</p>
        {error && <p className="notice" role="alert">{error}</p>}
        <div className="dialog-footer">
          <button autoFocus type="button" disabled={busy} onClick={onClose}>Keep task</button>
          <button type="button" className="danger" disabled={busy} onClick={remove}>{busy ? 'Deleting…' : 'Delete permanently'}</button>
        </div>
      </div>
    </Modal>
  );
}
