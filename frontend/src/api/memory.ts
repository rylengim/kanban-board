import type { Task, TaskApi, TaskInput } from './types';

export function createMemoryApi(initial: Task[] = []): TaskApi {
  let tasks = initial.map(task => ({ ...task }));
  function find(id: string) {
    const task = tasks.find(item => item.id === id);
    if (!task) throw new Error('Task not found. Refresh the board to see recent changes.');
    return task;
  }
  return {
    async list() { return tasks.map(task => ({ ...task })); },
    async create(input: TaskInput) {
      const now = new Date().toISOString();
      const task: Task = { ...input, title: input.title.trim(), id: crypto.randomUUID(), created_at: now, updated_at: now };
      tasks = [...tasks, task];
      return { ...task };
    },
    async update(id, input) {
      const task = { ...find(id), ...input, updated_at: new Date().toISOString() };
      task.title = task.title.trim();
      tasks = tasks.map(item => item.id === id ? task : item);
      return { ...task };
    },
    async remove(id) {
      find(id);
      tasks = tasks.filter(task => task.id !== id);
    },
  };
}

const samples: TaskInput[] = [
  { title: 'Map out the first version', description: 'Keep it small. Decide what matters most and give every idea a home.', status: 'todo', priority: 'high' },
  { title: 'Collect a little inspiration', description: 'Save a few thoughtful examples to guide the details.', status: 'todo', priority: 'low' },
  { title: 'Bring the board to life', description: 'A clear place for the work ahead, the work in motion, and the small wins.', status: 'in_progress', priority: 'high' },
  { title: 'Polish the small details', description: 'Check the labels, empty states, and keyboard flow.', status: 'in_progress', priority: 'medium' },
  { title: 'Start with a simple idea', description: 'Less to manage. More room to make progress.', status: 'done', priority: 'medium' },
  { title: 'Make space for focused work', description: 'One board. Three columns. A fresh start.', status: 'done', priority: 'low' },
];

export function createDemoApi() {
  return createMemoryApi(samples.map((task, index) => ({
    ...task, id: `52e04a1c-6bf4-464e-96ac-f1c87cac6b7${index}`,
    created_at: `2026-09-16T09:0${index}:00Z`, updated_at: `2026-09-16T09:0${index}:00Z`,
  })));
}
