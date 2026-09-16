import { useState } from 'react';
import type { Task, TaskApi, TaskPriority, TaskStatus } from './api/types';
import { columns } from './board';
import { DeleteDialog } from './components/DeleteDialog';
import { Icon } from './components/Icon';
import { TaskCard } from './components/TaskCard';
import { TaskDialog } from './components/TaskDialog';
import { useBoard } from './useBoard';

type Editor = { task?: Task; initialStatus: TaskStatus };

export default function App({ api, demo = false }: { api: TaskApi; demo?: boolean }) {
  const board = useBoard(api);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState<TaskPriority | 'all'>('all');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const query = search.trim().toLocaleLowerCase();
  const filtered = query !== '' || priority !== 'all';
  const visible = board.tasks.filter(task => (priority === 'all' || task.priority === priority)
    && `${task.title} ${task.description}`.toLocaleLowerCase().includes(query));
  const done = board.tasks.filter(task => task.status === 'done').length;
  const disabled = board.loading || board.saving;
  function add(status: TaskStatus = 'todo') { setEditor({ initialStatus: status }); }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#board">Skip to board</a>
      <aside className="sidebar">
        <a className="brand" href="#board" aria-label="Boardlet home"><span className="brand-mark"><Icon name="board" size={23} /></span>boardlet<span aria-hidden="true">.</span></a>
        <nav aria-label="Workspace">
          <p className="workspace-label">Your workspace</p>
          <a className="active-nav" href="#board" aria-current="page"><Icon name="board" size={18} />Project board<span className="nav-dot" /></a>
        </nav>
        <div className="sidebar-note">
          <span className="plant"><Icon name="plant" size={35} /></span>
          <strong>Small steps add up.</strong>
          <p>A little focus today.<br />Something to be proud of tomorrow.</p>
        </div>
        <div className="sidebar-bottom"><span className="status-dot" />A little space for your work</div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><Icon name="chevron" size={12} /><strong>Project board</strong></div>
          <span className="mode-badge"><span className="status-dot" />{demo ? 'Demo · resets on reload' : 'Local workspace'}</span>
        </header>
        <main id="board" className="board-content">
          <div className="board-heading">
            <div><p className="eyebrow">Room to make progress</p><h1>Project board</h1><p className="subtitle">Big ideas. Small steps. Keep things moving.</p></div>
            <button className="primary" aria-label="New task" disabled={disabled} onClick={() => add()}><Icon name="plus" /><span>New task</span></button>
          </div>
          <div className="board-toolbar">
            <div className="search-field"><Icon name="search" size={17} /><input type="search" aria-label="Search tasks" placeholder="Search your tasks…" value={search} onChange={event => setSearch(event.target.value)} /></div>
            <select className="priority-filter" aria-label="Filter by priority" value={priority} onChange={event => setPriority(event.target.value as TaskPriority | 'all')}>
              <option value="all">All priorities</option><option value="high">High priority</option><option value="medium">Medium priority</option><option value="low">Low priority</option>
            </select>
            {filtered && <button className="clear-filters" onClick={() => { setSearch(''); setPriority('all'); }}>Clear filters</button>}
            <button className="refresh" aria-label="Refresh board" disabled={disabled} onClick={() => void board.refresh()}><Icon name="refresh" size={16} /><span>Refresh</span></button>
          </div>
          <div className="board-meta">
            <span aria-live="polite">{visible.length} of {board.tasks.length} tasks</span>
            <span className="completion"><progress aria-label="Tasks completed" value={done} max={board.tasks.length || 1} />{done} completed</span>
          </div>
          <p className="sr-only" role="status">{board.announcement}</p>
          {board.error && <p className="notice" role="alert"><Icon name="alert" />{board.error}</p>}
          {board.loading && <p className="loading" role="status">Loading your board…</p>}
          {!board.loading && !board.error && board.tasks.length === 0 && <p className="board-empty-intro">Your next idea starts here.</p>}
          <div className="columns" aria-busy={board.loading}>
            {columns.map(column => {
              const tasks = visible.filter(task => task.status === column.status);
              return (
                <section key={column.status} className={`column ${column.status}`} aria-labelledby={`column-${column.status}`}>
                  <div className="column-heading"><span className="column-dot" /><h2 id={`column-${column.status}`}>{column.title}</h2><span className="column-count" aria-label={`${tasks.length} tasks`}>{tasks.length}</span><button aria-label={`Add task to ${column.title}`} disabled={disabled} onClick={() => add(column.status)}><Icon name="plus" size={16} /></button></div>
                  {board.loading ? <div aria-hidden="true"><div className="skeleton" /><div className="skeleton" /></div> :
                    <div className="task-list">
                      {tasks.map(task => <TaskCard key={task.id} task={task} disabled={disabled} onEdit={task => setEditor({ task, initialStatus: task.status })} onMove={(task, status) => void board.move(task, status)} />)}
                      {tasks.length === 0 && <div className="column-empty"><p>{filtered ? 'No matching tasks.' : board.error && board.tasks.length === 0 ? 'Refresh to load your tasks.' : column.empty}<span>{filtered ? 'Try a different search or priority.' : 'One small step at a time.'}</span></p></div>}
                    </div>}
                  <button className="column-add" disabled={disabled} onClick={() => add(column.status)}><Icon name="plus" size={16} />Add task</button>
                </section>
              );
            })}
          </div>
          <p className="board-footer">Made for a little less busy.<span aria-hidden="true">✧</span>And a little more done.</p>
        </main>
      </div>
      {editor && <TaskDialog {...editor} busy={board.saving} onSave={board.save} onClose={() => setEditor(null)} onDelete={task => { setEditor(null); setDeleting(task); }} />}
      {deleting && <DeleteDialog task={deleting} busy={board.saving} onDelete={board.remove} onClose={() => setDeleting(null)} />}
    </div>
  );
}
