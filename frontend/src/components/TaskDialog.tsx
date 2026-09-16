import { useRef, useState, type FormEvent } from 'react';
import type { Task, TaskInput, TaskPriority, TaskStatus } from '../api/types';
import { columns, errorMessage } from '../board';
import { Modal } from './Modal';

export function TaskDialog({ task, initialStatus, busy, onSave, onClose, onDelete }: {
  task?: Task; initialStatus: TaskStatus; busy: boolean;
  onSave(input: TaskInput, id?: string): Promise<void>;
  onClose(): void; onDelete(task: Task): void;
}) {
  const [input, setInput] = useState<TaskInput>(task ?? { title: '', description: '', priority: 'medium', status: initialStatus });
  const [error, setError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!input.title.trim()) { setError('Enter a title so your task is easy to find.'); return; }
    if (Array.from(input.title).length > 120) { setError('Keep the title to 120 characters or fewer.'); return; }
    if (Array.from(input.description).length > 2000) { setError('Keep the description to 2,000 characters or fewer.'); return; }
    setError('');
    try {
      await onSave({ title: input.title.trim(), description: input.description, status: input.status, priority: input.priority }, task?.id);
      onClose();
    } catch (cause) { setError(errorMessage(cause)); }
  }
  return (
    <Modal title={task ? 'Edit task' : 'A little step forward'} busy={busy} initialFocus={titleRef} onClose={onClose}>
      <p className="dialog-subtitle">{task ? 'Give this task the details it needs.' : 'Capture an idea. You can work out the details as you go.'}</p>
      <form className="task-form" onSubmit={submit} noValidate>
        <fieldset disabled={busy}>
          <div className="form-field">
            <label htmlFor="task-title">Title</label>
            <input ref={titleRef} id="task-title" value={input.title} onChange={event => setInput({ ...input, title: event.target.value })} placeholder="What needs to happen?" required aria-describedby="title-help" />
            <span className="field-help" id="title-help">Required · 120 characters maximum</span>
          </div>
          <div className="form-field">
            <label htmlFor="task-description">Description</label>
            <textarea id="task-description" value={input.description} onChange={event => setInput({ ...input, description: event.target.value })} placeholder="A few details, a little context…" aria-describedby="description-help" />
            <span className="field-help" id="description-help">Optional · 2,000 characters maximum</span>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="task-priority">Priority</label>
              <select id="task-priority" value={input.priority} onChange={event => setInput({ ...input, priority: event.target.value as TaskPriority })}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="task-status">Status</label>
              <select id="task-status" value={input.status} onChange={event => setInput({ ...input, status: event.target.value as TaskStatus })}>
                {columns.map(column => <option key={column.status} value={column.status}>{column.title}</option>)}
              </select>
            </div>
          </div>
        </fieldset>
        {error && <p className="notice" role="alert">{error}</p>}
        <div className="dialog-footer">
          {task && <button className="delete-link" type="button" disabled={busy} onClick={() => onDelete(task)}>Delete task</button>}
          <button type="button" disabled={busy} onClick={onClose}>Cancel</button>
          <button type="submit" className="primary" disabled={busy}>{busy ? 'Saving…' : task ? 'Save changes' : 'Create task'}</button>
        </div>
      </form>
    </Modal>
  );
}
