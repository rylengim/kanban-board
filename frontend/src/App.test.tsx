import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { createMemoryApi } from './api/memory';
import type { Task } from './api/types';

const sample: Task[] = [
  { id: '52e04a1c-6bf4-464e-96ac-f1c87cac6b70', title: 'Plan the demo', description: 'Show the board', priority: 'high', status: 'todo', created_at: '2026-09-16T09:00:00Z', updated_at: '2026-09-16T09:00:00Z' },
  { id: '52e04a1c-6bf4-464e-96ac-f1c87cac6b71', title: 'Write notes', description: 'Capture decisions', priority: 'low', status: 'done', created_at: '2026-09-16T09:01:00Z', updated_at: '2026-09-16T09:01:00Z' },
];

describe('Boardlet user journeys', () => {
  it('creates, edits, moves and confirms deletion of a task', async () => {
    const user = userEvent.setup();
    render(<App api={createMemoryApi([])} />);
    await screen.findByText('Your next idea starts here.');
    await user.click(screen.getByRole('button', { name: 'New task' }));
    expect(screen.getByLabelText('Priority')).toHaveValue('medium');
    expect(screen.getByLabelText('Status')).toHaveValue('todo');
    await user.type(screen.getByLabelText('Title'), '  Prepare demo  ');
    await user.type(screen.getByLabelText('Description'), 'Keep it focused.');
    await user.click(screen.getByRole('button', { name: 'Create task' }));
    expect(await screen.findByRole('heading', { name: 'Prepare demo' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Edit Prepare demo' }));
    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'Share demo');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await screen.findByRole('heading', { name: 'Share demo' });
    await user.selectOptions(screen.getByRole('combobox', { name: 'Move Share demo' }), 'done');
    await waitFor(() => expect(within(screen.getByRole('region', { name: 'Done' })).getByRole('heading', { name: 'Share demo' })).toBeVisible());
    await user.click(screen.getByRole('button', { name: 'Edit Share demo' }));
    await user.click(screen.getByRole('button', { name: 'Delete task' }));
    await user.click(screen.getByRole('button', { name: 'Keep task' }));
    expect(screen.getByRole('heading', { name: 'Share demo' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Edit Share demo' }));
    await user.click(screen.getByRole('button', { name: 'Delete task' }));
    await user.click(screen.getByRole('button', { name: 'Delete permanently' }));
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Share demo' })).not.toBeInTheDocument());
  });

  it('combines text and priority filters and restores the full board', async () => {
    const user = userEvent.setup();
    render(<App api={createMemoryApi(sample)} />);
    await screen.findByRole('heading', { name: 'Plan the demo' });
    await user.type(screen.getByRole('searchbox', { name: 'Search tasks' }), 'decisions');
    expect(screen.queryByRole('heading', { name: 'Plan the demo' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Write notes' })).toBeVisible();
    expect(screen.getByText('1 of 2 tasks')).toBeVisible();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter by priority' }), 'high');
    expect(screen.getByText('0 of 2 tasks')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('validates blank and overlong titles and descriptions before saving', async () => {
    const user = userEvent.setup();
    const api = createMemoryApi([]);
    render(<App api={api} />);
    await screen.findByText('Your next idea starts here.');
    await user.click(screen.getByRole('button', { name: 'New task' }));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: '   ' } });
    await user.click(screen.getByRole('button', { name: 'Create task' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a title');
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'a'.repeat(121) } });
    await user.click(screen.getByRole('button', { name: 'Create task' }));
    expect(screen.getByRole('alert')).toHaveTextContent('120');
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Valid title' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'a'.repeat(2001) } });
    await user.click(screen.getByRole('button', { name: 'Create task' }));
    expect(screen.getByRole('alert')).toHaveTextContent('2,000');
    expect(await api.list()).toHaveLength(0);
  });

  it('preserves form input on failed save and allows a deliberate retry', async () => {
    const user = userEvent.setup();
    const api = createMemoryApi([]);
    vi.spyOn(api, 'create').mockRejectedValueOnce(new Error('Server is unavailable.'));
    render(<App api={api} />);
    await screen.findByText('Your next idea starts here.');
    await user.click(screen.getByRole('button', { name: 'New task' }));
    await user.type(screen.getByLabelText('Title'), 'Keep my draft');
    await user.click(screen.getByRole('button', { name: 'Create task' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Server is unavailable.');
    expect(screen.getByLabelText('Title')).toHaveValue('Keep my draft');
    await user.click(screen.getByRole('button', { name: 'Create task' }));
    expect(await screen.findByRole('heading', { name: 'Keep my draft' })).toBeVisible();
  });

  it('shows loading, recovers from a load failure, and keeps a task in place after a failed move', async () => {
    const user = userEvent.setup();
    const api = createMemoryApi(sample);
    vi.spyOn(api, 'list').mockRejectedValueOnce(new Error('Could not load your board.'));
    vi.spyOn(api, 'update').mockRejectedValueOnce(new Error('Could not move task.'));
    render(<App api={api} />);
    expect(screen.getByText('Loading your board…')).toBeVisible();
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load your board.');
    await user.click(screen.getByRole('button', { name: 'Refresh board' }));
    await screen.findByRole('heading', { name: 'Plan the demo' });
    await user.selectOptions(screen.getByRole('combobox', { name: 'Move Plan the demo' }), 'done');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not move task.');
    expect(within(screen.getByRole('region', { name: 'To do' })).getByRole('heading', { name: 'Plan the demo' })).toBeVisible();
  });

  it('locks saving and refresh while a create request is pending', async () => {
    const user = userEvent.setup();
    const api = createMemoryApi([]);
    let resolveSave: (task: Task) => void = () => {};
    vi.spyOn(api, 'create').mockImplementation(() => new Promise(resolve => { resolveSave = resolve; }));
    render(<App api={api} />);
    await screen.findByText('Your next idea starts here.');
    await user.click(screen.getByRole('button', { name: 'New task' }));
    await user.type(screen.getByLabelText('Title'), 'Wait for save');
    await user.click(screen.getByRole('button', { name: 'Create task' }));
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    expect(screen.getByLabelText('Title')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Refresh board' })).toBeDisabled();
    resolveSave({ ...sample[0], title: 'Wait for save' });
    expect(await screen.findByRole('heading', { name: 'Wait for save' })).toBeVisible();
  });

  it('retains a card when deletion fails and permits retrying', async () => {
    const user = userEvent.setup();
    const api = createMemoryApi(sample);
    vi.spyOn(api, 'remove').mockRejectedValueOnce(new Error('Delete failed. Try again.'));
    render(<App api={api} />);
    await screen.findByRole('heading', { name: 'Plan the demo' });
    await user.click(screen.getByRole('button', { name: 'Edit Plan the demo' }));
    await user.click(screen.getByRole('button', { name: 'Delete task' }));
    await user.click(screen.getByRole('button', { name: 'Delete permanently' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Delete failed. Try again.');
    expect(await api.list()).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Delete permanently' }));
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Plan the demo' })).not.toBeInTheDocument());
  });
});
