from datetime import datetime, timedelta
from uuid import UUID, uuid4

import pytest


def create_task(client, **changes):
    response = client.post("/api/tasks", json={"title": "Prepare demo", **changes})
    assert response.status_code == 201, response.text
    return response.json()


def assert_error(response, status_code):
    assert response.status_code == status_code
    assert set(response.json()) == {"detail"}
    assert isinstance(response.json()["detail"], str)
    assert response.json()["detail"]


def test_health_and_empty_board(client):
    assert client.get("/api/health").json() == {"status": "ok"}
    assert client.get("/api/tasks").json() == {"items": [], "total": 0}


def test_create_trims_title_preserves_description_and_returns_defaults(client):
    task = create_task(client, title="  Prepare demo  ", description="  Keep this\n ")
    assert task["title"] == "Prepare demo"
    assert task["description"] == "  Keep this\n "
    assert task["status"] == "todo"
    assert task["priority"] == "medium"
    assert str(UUID(task["id"])) == task["id"]
    created = datetime.fromisoformat(task["created_at"])
    assert created.utcoffset() == timedelta(0)
    assert task["created_at"] == task["updated_at"]
    assert client.get(f"/api/tasks/{task['id']}").json() == task


def test_default_description_and_unique_ids(client):
    first = create_task(client)
    second = create_task(client)
    assert first["description"] == ""
    assert first["id"] != second["id"]


@pytest.mark.parametrize("status", ["todo", "in_progress", "done"])
@pytest.mark.parametrize("priority", ["low", "medium", "high"])
def test_create_accepts_all_statuses_and_priorities(client, status, priority):
    task = create_task(client, status=status, priority=priority)
    assert (task["status"], task["priority"]) == (status, priority)


def test_patch_changes_only_supplied_fields_and_advances_timestamp(client):
    task = create_task(client, description="Keep me", priority="high")
    response = client.patch(f"/api/tasks/{task['id']}", json={"title": "  Edited  "})
    assert response.status_code == 200
    updated = response.json()
    assert updated == {**task, "title": "Edited", "updated_at": updated["updated_at"]}
    assert datetime.fromisoformat(updated["updated_at"]) > datetime.fromisoformat(
        task["updated_at"]
    )
    assert datetime.fromisoformat(updated["updated_at"]).utcoffset() == timedelta(0)
    assert client.get(f"/api/tasks/{task['id']}").json() == updated


@pytest.mark.parametrize("status", ["todo", "in_progress", "done"])
def test_move_task(client, status):
    task = create_task(client)
    response = client.patch(f"/api/tasks/{task['id']}", json={"status": status})
    assert response.status_code == 200
    assert response.json()["status"] == status


def test_clear_description_and_change_priority(client):
    task = create_task(client, description="Remove me")
    response = client.patch(f"/api/tasks/{task['id']}", json={"description": "", "priority": "low"})
    assert response.status_code == 200
    assert response.json()["description"] == ""
    assert response.json()["priority"] == "low"


def test_delete_removes_task_and_repeated_delete_is_missing(client):
    task = create_task(client)
    response = client.delete(f"/api/tasks/{task['id']}")
    assert response.status_code == 204
    assert response.content == b""
    assert client.get("/api/tasks").json() == {"items": [], "total": 0}
    assert_error(client.get(f"/api/tasks/{task['id']}"), 404)
    assert_error(client.delete(f"/api/tasks/{task['id']}"), 404)


@pytest.mark.parametrize("method", ["get", "patch", "delete"])
def test_missing_task_returns_readable_404(client, method):
    kwargs = {"json": {"title": "Edit missing"}} if method == "patch" else {}
    response = client.request(method, f"/api/tasks/{uuid4()}", **kwargs)
    assert_error(response, 404)
    assert response.json() == {"detail": "Task not found"}


@pytest.mark.parametrize("method", ["get", "patch", "delete"])
def test_malformed_uuid_returns_422(client, method):
    kwargs = {"json": {"title": "Edit invalid"}} if method == "patch" else {}
    assert_error(client.request(method, "/api/tasks/not-a-uuid", **kwargs), 422)


INVALID_FIELDS = [
    {"title": ""},
    {"title": " \t\n "},
    {"title": "\u001c"},
    {"title": "x" * 121},
    {"title": " " + "x" * 120},
    {"title": None},
    {"title": 42},
    {"description": "x" * 2001},
    {"description": None},
    {"description": 42},
    {"priority": "urgent"},
    {"priority": None},
    {"status": "finished"},
    {"status": None},
    {"unexpected": "field"},
    {"id": str(uuid4())},
    {"created_at": "2026-01-01T00:00:00Z"},
]


@pytest.mark.parametrize("fields", INVALID_FIELDS)
def test_create_rejects_invalid_fields_without_saving(client, fields):
    response = client.post("/api/tasks", json={"title": "Valid", **fields})
    assert_error(response, 422)
    assert client.get("/api/tasks").json() == {"items": [], "total": 0}


@pytest.mark.parametrize("fields", [*INVALID_FIELDS, {}])
def test_patch_rejects_invalid_fields_without_changing_task(client, fields):
    task = create_task(client)
    response = client.patch(f"/api/tasks/{task['id']}", json=fields)
    assert_error(response, 422)
    assert client.get(f"/api/tasks/{task['id']}").json() == task


@pytest.mark.parametrize("body", [{}, [], "title"])
def test_create_requires_object_with_title(client, body):
    assert_error(client.post("/api/tasks", json=body), 422)


def test_invalid_json_returns_readable_422(client):
    response = client.post(
        "/api/tasks", content="{broken", headers={"content-type": "application/json"}
    )
    assert_error(response, 422)


def test_accepts_exact_field_limits(client):
    task = create_task(client, title="x" * 120, description="x" * 2000)
    assert len(task["title"]) == 120
    assert len(task["description"]) == 2000


def test_list_pagination_has_total_and_stable_creation_order(client):
    tasks = [create_task(client, title=f"Card {index}") for index in range(5)]
    response = client.get("/api/tasks", params={"limit": 2, "offset": 1})
    assert response.status_code == 200
    assert response.json() == {"items": tasks[1:3], "total": 5}
    assert client.get("/api/tasks?offset=20").json() == {"items": [], "total": 5}
    assert client.get("/api/tasks").json() == {"items": tasks, "total": 5}


def test_default_list_limit_is_100(client):
    for index in range(101):
        create_task(client, title=f"Card {index}")
    page = client.get("/api/tasks").json()
    assert len(page["items"]) == 100
    assert page["total"] == 101
    assert len(client.get("/api/tasks?offset=100").json()["items"]) == 1


@pytest.mark.parametrize(
    "query", ["limit=0", "limit=101", "limit=x", "limit=1.5", "offset=-1", "offset=x"]
)
def test_invalid_pagination_returns_readable_422(client, query):
    assert_error(client.get(f"/api/tasks?{query}"), 422)


@pytest.mark.parametrize("origin", ["http://localhost:5173", "http://127.0.0.1:5173"])
def test_cors_allows_configured_frontend(client, origin):
    response = client.options(
        "/api/tasks",
        headers={"Origin": origin, "Access-Control-Request-Method": "POST"},
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == origin


def test_cors_does_not_allow_unrelated_origin(client):
    response = client.get("/api/tasks", headers={"Origin": "https://unrelated.example"})
    assert "access-control-allow-origin" not in response.headers
