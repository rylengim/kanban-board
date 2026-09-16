from threading import RLock
from uuid import UUID

from app.models import Task, TaskCreate, TaskPage, TaskUpdate
from app.repository import changed_task, new_task


class MemoryTaskRepository:
    """Process-local storage retained for the in-memory homework checkpoint."""

    def __init__(self) -> None:
        self._tasks: dict[UUID, Task] = {}
        self._lock = RLock()

    def initialize(self) -> None:
        """Memory storage needs no startup work."""

    def close(self) -> None:
        """Memory storage holds no external resources."""

    def list_tasks(self, *, limit: int, offset: int) -> TaskPage:
        with self._lock:
            ordered = sorted(self._tasks.values(), key=lambda task: (task.created_at, task.id))
            return TaskPage(items=ordered[offset : offset + limit], total=len(ordered))

    def get_task(self, task_id: UUID) -> Task | None:
        with self._lock:
            return self._tasks.get(task_id)

    def create_task(self, data: TaskCreate) -> Task:
        with self._lock:
            task = new_task(data)
            self._tasks[task.id] = task
            return task

    def update_task(self, task_id: UUID, data: TaskUpdate) -> Task | None:
        with self._lock:
            task = self._tasks.get(task_id)
            if task is None:
                return None
            updated = changed_task(task, data)
            self._tasks[task_id] = updated
            return updated

    def delete_task(self, task_id: UUID) -> bool:
        with self._lock:
            return self._tasks.pop(task_id, None) is not None
