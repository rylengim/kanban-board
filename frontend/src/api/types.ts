export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
}

export interface Task extends TaskInput {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskPage {
  items: Task[];
  total: number;
}

export interface TaskApi {
  list(): Promise<Task[]>;
  create(input: TaskInput): Promise<Task>;
  update(id: string, input: Partial<TaskInput>): Promise<Task>;
  remove(id: string): Promise<void>;
}
