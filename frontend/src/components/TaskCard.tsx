import type { Task, TaskStatus } from '../api/types';
import { columns } from '../board';
import { Icon } from './Icon';

export function TaskCard({ task, disabled, onEdit, onMove }: { task: Task; disabled: boolean; onEdit(task: Task): void; onMove(task: Task, status: TaskStatus): void }) {
  return (
    <article className="task-card" aria-labelledby={`task-${task.id}`}>
      <div className="card-top">
        <span className={`priority ${task.priority}`}><span className="priority-icon" aria-hidden="true"><i /><i /><i /></span>{task.priority} priority</span>
        <button className="edit-button" aria-label={`Edit ${task.title}`} disabled={disabled} onClick={() => onEdit(task)}><Icon name="edit" size={15} /></button>
      </div>
      <h3 id={`task-${task.id}`}>{task.title}</h3>
      {task.description && <p className="task-description">{task.description}</p>}
      <div className="card-footer">
        <span>MOVE TO</span>
        <select value={task.status} aria-label={`Move ${task.title}`} disabled={disabled} onChange={event => onMove(task, event.target.value as TaskStatus)}>
          {columns.map(column => <option key={column.status} value={column.status}>{column.title}</option>)}
        </select>
      </div>
    </article>
  );
}
