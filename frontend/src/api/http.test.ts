import { describe, expect, it, vi } from 'vitest';
import { createHttpApi } from './http';
import type { Task } from './types';

const task: Task = { id: '52e04a1c-6bf4-464e-96ac-f1c87cac6b70', title: 'First task', description: '', priority: 'medium', status: 'todo', created_at: '2026-09-16T09:00:00Z', updated_at: '2026-09-16T09:00:00Z' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('HTTP task adapter', () => {
  it('loads all pages before returning the full board', async () => {
    const second = { ...task, id: '52e04a1c-6bf4-464e-96ac-f1c87cac6b71', title: 'Second task' };
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(json({ items: [task], total: 2 }))
      .mockResolvedValueOnce(json({ items: [second], total: 2 }));
    const api = createHttpApi('http://localhost:8000/', fetcher);
    expect(await api.list()).toEqual([task, second]);
    expect(fetcher.mock.calls.map(([url]) => String(url))).toEqual([
      'http://localhost:8000/api/tasks?limit=100&offset=0',
      'http://localhost:8000/api/tasks?limit=100&offset=1',
    ]);
  });

  it('does not pretend an incomplete or malformed board is empty', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(json({ items: [], total: 2 }))
      .mockResolvedValueOnce(json({ tasks: [] }));
    const api = createHttpApi('http://localhost:8000', fetcher);
    await expect(api.list()).rejects.toThrow('Refresh');
    await expect(api.list()).rejects.toThrow('invalid task list');
  });

  it.each(['status', 'priority'] as const)('rejects an array in the %s field of a task response', async field => {
    const malformed = { ...task, [field]: [task[field]] };
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(json({ items: [malformed], total: 1 }))
      .mockResolvedValueOnce(json(malformed));
    const api = createHttpApi('http://localhost:8000', fetcher);
    await expect(api.list()).rejects.toThrow('invalid task list');
    await expect(api.update(task.id, { status: 'done' })).rejects.toThrow('Check the board in another tab');
  });

  it('uses contract fields and methods for creates, partial updates and bodyless deletes', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(json(task, 201))
      .mockResolvedValueOnce(json({ ...task, status: 'done' }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const api = createHttpApi('http://localhost:8000', fetcher);
    const input = { title: task.title, description: '', priority: task.priority, status: task.status };
    expect(await api.create(input)).toEqual(task);
    expect(await api.update(task.id, { status: 'done' })).toMatchObject({ status: 'done' });
    await expect(api.remove(task.id)).resolves.toBeUndefined();
    expect(fetcher.mock.calls[0]).toEqual(['http://localhost:8000/api/tasks', expect.objectContaining({ method: 'POST', body: JSON.stringify(input), headers: { 'Content-Type': 'application/json' } })]);
    expect(fetcher.mock.calls[1]).toEqual([`http://localhost:8000/api/tasks/${task.id}`, expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ status: 'done' }) })]);
    expect(fetcher.mock.calls[2]).toEqual([`http://localhost:8000/api/tasks/${task.id}`, expect.objectContaining({ method: 'DELETE' })]);
  });

  it('preserves readable server error detail and handles non-JSON errors', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(json({ detail: 'Task not found' }, 404))
      .mockResolvedValueOnce(new Response('Bad gateway', { status: 502 }));
    const api = createHttpApi('http://localhost:8000', fetcher);
    await expect(api.remove(task.id)).rejects.toThrow('Task not found');
    await expect(api.list()).rejects.toThrow('502');
  });

  it('reports network failure and never automatically retries an uncertain create', async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));
    const api = createHttpApi('http://localhost:8000', fetcher);
    await expect(api.create({ title: task.title, description: '', priority: 'medium', status: 'todo' })).rejects.toThrow('Your draft is kept. Check the board in another tab before retrying');
    expect(fetcher).toHaveBeenCalledTimes(1);
    await expect(api.list()).rejects.toThrow('Could not reach the server');
  });

  it('gives draft-preserving recovery guidance when a saved response is unreadable', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('not JSON', { status: 201 }));
    const api = createHttpApi('http://localhost:8000', fetcher);
    await expect(api.create({ title: task.title, description: '', priority: 'medium', status: 'todo' })).rejects.toThrow('Check the board in another tab before retrying');
  });
});
