import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.memory import MemoryTaskRepository


@pytest.fixture
def client():
    with TestClient(create_app(repository=MemoryTaskRepository())) as test_client:
        yield test_client
