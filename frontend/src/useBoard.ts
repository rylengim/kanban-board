import { useCallback, useEffect, useRef, useState } from 'react';
import type { Task, TaskApi, TaskInput, TaskStatus } from './api/types';
import { columns, errorMessage } from './board';

export function useBoard(api: TaskApi) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const request = useRef(0);

  const refresh = useCallback(async () => {
    const current = ++request.current;
    setLoading(true);
    setError('');
    try {
      const result = await api.list();
      if (current === request.current) { setTasks(result); setAnnouncement('Board refreshed.'); }
    } catch (cause) { if (current === request.current) setError(errorMessage(cause)); }
    finally { if (current === request.current) setLoading(false); }
  }, [api]);

  useEffect(() => {
    void refresh();
    return () => { request.current += 1; };
  }, [refresh]);

  async function save(input: TaskInput, id?: string) {
    setSaving(true);
    setError('');
    try {
      const result = id ? await api.update(id, input) : await api.create(input);
      setTasks(current => id ? current.map(task => task.id === id ? result : task) : [...current, result]);
      setAnnouncement(`${result.title} ${id ? 'updated' : 'created'}.`);
    } finally { setSaving(false); }
  }

  async function move(task: Task, status: TaskStatus) {
    setSaving(true);
    setError('');
    try {
      const result = await api.update(task.id, { status });
      setTasks(current => current.map(item => item.id === result.id ? result : item));
      setAnnouncement(`${task.title} moved to ${columns.find(column => column.status === status)?.title}.`);
    } catch (cause) { setError(errorMessage(cause)); }
    finally { setSaving(false); }
  }

  async function remove(id: string) {
    setSaving(true);
    setError('');
    try {
      await api.remove(id);
      setTasks(current => current.filter(task => task.id !== id));
      setAnnouncement('Task deleted.');
    } finally { setSaving(false); }
  }

  return { tasks, loading, saving, error, announcement, refresh, save, move, remove };
}
