import type { TaskStatus } from './api/types';

export const columns: { status: TaskStatus; title: string; empty: string }[] = [
  { status: 'todo', title: 'To do', empty: 'Make a little room for what’s next.' },
  { status: 'in_progress', title: 'In progress', empty: 'Ready when you are.' },
  { status: 'done', title: 'Done', empty: 'Your small wins will live here.' },
];

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
