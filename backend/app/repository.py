from datetime import UTC, datetime, timedelta
from typing import Protocol
from uuid import UUID, uuid4

from app.models import Task, TaskCreate, TaskPage, TaskUpdate


class TaskRepository(Protocol):
    """Each operation is atomic; application lifespan owns initialize/close."""

    def initialize(self) -> None: ...
    def close(self) -> None: ...
    def list_tasks(self, *, limit: int, offset: int) -> TaskPage: ...
    def get_task(self, task_id: UUID) -> Task | None: ...
    def create_task(self, data: TaskCreate) -> Task: ...
    def update_task(self, task_id: UUID, data: TaskUpdate) -> Task | None: ...
    def delete_task(self, task_id: UUID) -> bool: ...


def new_task(data: TaskCreate) -> Task:
    now = datetime.now(UTC)
    return Task(id=uuid4(), **data.model_dump(), created_at=now, updated_at=now)


def changed_task(task: Task, data: TaskUpdate) -> Task:
    now = max(datetime.now(UTC), task.updated_at + timedelta(microseconds=1))
    return task.model_copy(update={**data.model_dump(exclude_unset=True), "updated_at": now})
