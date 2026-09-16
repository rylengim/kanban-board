from datetime import UTC, datetime
from threading import RLock
from uuid import UUID

from sqlalchemy import DateTime, String, Uuid, create_engine, delete, func, select
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
from sqlalchemy.pool import StaticPool

from app.models import Task, TaskCreate, TaskPage, TaskUpdate
from app.repository import changed_task, new_task


class Base(DeclarativeBase):
    pass


class TaskRecord(Base):
    __tablename__ = "tasks"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True)
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(String(2000))
    status: Mapped[str] = mapped_column(String(11))
    priority: Mapped[str] = mapped_column(String(6))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


def utc_datetime(value: datetime) -> datetime:
    # SQLite drops timezone metadata; stored timestamps are always UTC.
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


def record_task(record: TaskRecord) -> Task:
    return Task(
        id=record.id,
        title=record.title,
        description=record.description,
        status=record.status,
        priority=record.priority,
        created_at=utc_datetime(record.created_at),
        updated_at=utc_datetime(record.updated_at),
    )


class SQLAlchemyTaskRepository:
    """Portable SQLAlchemy expressions with a session per operation.

    The lock also protects a shared in-memory SQLite connection across request
    threads. The application owns the engine and disposes it on shutdown.
    """

    def __init__(self, database_url: str) -> None:
        url = make_url(database_url)
        options = {}
        if url.get_backend_name() == "sqlite":
            options["connect_args"] = {"check_same_thread": False}
            if url.database in {None, "", ":memory:"}:
                options["poolclass"] = StaticPool
        self.engine = create_engine(url, **options)
        self._sessions = sessionmaker(self.engine, expire_on_commit=False)
        self._lock = RLock()

    def initialize(self) -> None:
        Base.metadata.create_all(self.engine)

    def close(self) -> None:
        self.engine.dispose()

    def list_tasks(self, *, limit: int, offset: int) -> TaskPage:
        with self._lock, self._sessions() as session:
            total = session.scalar(select(func.count()).select_from(TaskRecord))
            query = (
                select(TaskRecord)
                .order_by(TaskRecord.created_at, TaskRecord.id)
                .offset(offset)
                .limit(limit)
            )
            return TaskPage(items=[record_task(row) for row in session.scalars(query)], total=total)

    def get_task(self, task_id: UUID) -> Task | None:
        with self._lock, self._sessions() as session:
            record = session.get(TaskRecord, task_id)
            return record_task(record) if record is not None else None

    def create_task(self, data: TaskCreate) -> Task:
        task = new_task(data)
        with self._lock, self._sessions.begin() as session:
            session.add(TaskRecord(**task.model_dump()))
        return task

    def update_task(self, task_id: UUID, data: TaskUpdate) -> Task | None:
        with self._lock, self._sessions.begin() as session:
            record = session.scalar(
                select(TaskRecord).where(TaskRecord.id == task_id).with_for_update()
            )
            if record is None:
                return None
            task = changed_task(record_task(record), data)
            for field in data.model_fields_set:
                setattr(record, field, getattr(task, field))
            record.updated_at = task.updated_at
        return task

    def delete_task(self, task_id: UUID) -> bool:
        with self._lock, self._sessions.begin() as session:
            result = session.execute(delete(TaskRecord).where(TaskRecord.id == task_id))
            return result.rowcount > 0
