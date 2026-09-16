import type { Task, TaskApi } from './types';

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function isTask(value: unknown): value is Task {
  return isObject(value) && typeof value.id === 'string' && typeof value.title === 'string'
    && typeof value.description === 'string' && typeof value.created_at === 'string'
    && typeof value.updated_at === 'string' && typeof value.status === 'string'
    && ['todo', 'in_progress', 'done'].includes(value.status)
    && typeof value.priority === 'string' && ['low', 'medium', 'high'].includes(value.priority);
}

export function createHttpApi(baseUrl = 'http://localhost:8000', fetcher: typeof fetch = fetch): TaskApi {
  const base = baseUrl.replace(/\/+$/, '');
  async function request(path: string, init?: RequestInit): Promise<unknown> {
    let response: Response;
    try { response = await fetcher(`${base}${path}`, init); }
    catch {
      throw new Error(init?.method === 'POST'
        ? 'Could not confirm this save. Your draft is kept. Check the board in another tab before retrying to avoid a duplicate.'
        : 'Could not reach the server. Check that it is running, then try again.');
    }
    if (!response.ok) {
      let detail = `The server could not complete this request (${response.status}). Please try again.`;
      try {
        const body: unknown = await response.json();
        if (isObject(body) && typeof body.detail === 'string') detail = body.detail;
      } catch { /* An HTTP error may have a plain-text body. Keep its status visible. */ }
      throw new Error(detail);
    }
    if (response.status === 204) return undefined;
    try { return await response.json(); }
    catch { throw new Error('The server returned an unreadable response. Check the board in another tab before retrying.'); }
  }

  async function writeTask(path: string, method: string, input: unknown): Promise<Task> {
    const result = await request(path, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
    if (!isTask(result)) throw new Error('The server returned an invalid task. Check the board in another tab before retrying.');
    return result;
  }

  return {
    async list() {
      const tasks: Task[] = [];
      let total: number | undefined;
      do {
        const page = await request(`/api/tasks?limit=100&offset=${tasks.length}`);
        if (!isObject(page) || !Array.isArray(page.items) || !page.items.every(isTask)
          || typeof page.total !== 'number' || !Number.isInteger(page.total) || page.total < 0) {
          throw new Error('The server returned an invalid task list. Please try refreshing.');
        }
        if ((total !== undefined && page.total !== total)
          || (page.items.length === 0 && tasks.length < page.total)) {
          throw new Error('The board changed while loading. Refresh to load the complete board.');
        }
        total = page.total;
        tasks.push(...page.items);
      } while (tasks.length < total);
      if (tasks.length !== total || new Set(tasks.map(task => task.id)).size !== total) {
        throw new Error('The board changed while loading. Refresh to load the complete board.');
      }
      return tasks;
    },
    create(input) { return writeTask('/api/tasks', 'POST', input); },
    update(id, input) { return writeTask(`/api/tasks/${encodeURIComponent(id)}`, 'PATCH', input); },
    async remove(id) { await request(`/api/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' }); },
  };
}
