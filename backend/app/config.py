import os
from pathlib import Path

from app.memory import MemoryTaskRepository
from app.repository import TaskRepository
from app.sqlalchemy_repository import SQLAlchemyTaskRepository

DEFAULT_DATABASE_PATH = Path(__file__).resolve().parents[1] / "boardlet.db"
DEFAULT_DATABASE_URL = f"sqlite:///{DEFAULT_DATABASE_PATH}"


def configured_repository() -> TaskRepository:
    store = os.environ.get("BOARDLET_STORE", "sqlalchemy")
    if store == "memory":
        return MemoryTaskRepository()
    if store == "sqlalchemy":
        database_url = os.environ.get("DATABASE_URL", DEFAULT_DATABASE_URL)
        return SQLAlchemyTaskRepository(database_url)
    raise ValueError("BOARDLET_STORE must be 'memory' or 'sqlalchemy'")
