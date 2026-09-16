import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.memory import MemoryTaskRepository
from app.sqlalchemy_repository import SQLAlchemyTaskRepository


@pytest.fixture(params=["memory", "sqlite"])
def client(request, tmp_path):
    repository = (
        MemoryTaskRepository()
        if request.param == "memory"
        else SQLAlchemyTaskRepository(f"sqlite:///{tmp_path / 'test.sqlite'}")
    )
    with TestClient(create_app(repository=repository)) as test_client:
        yield test_client
