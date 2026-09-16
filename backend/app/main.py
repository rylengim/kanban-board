import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Annotated
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, Query, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import configured_repository
from app.models import Error, Health, Task, TaskCreate, TaskPage, TaskUpdate
from app.repository import TaskRepository

logger = logging.getLogger(__name__)


def get_repository(request: Request) -> TaskRepository:
    return request.app.state.repository


Repository = Annotated[TaskRepository, Depends(get_repository)]
VALIDATION_ERROR = {422: {"model": Error, "description": "Invalid request"}}
TASK_ERRORS = {**VALIDATION_ERROR, 404: {"model": Error, "description": "Task not found"}}


def create_app(repository: TaskRepository | None = None) -> FastAPI:
    """The app initializes and closes its injected repository for each lifespan."""
    task_repository = repository if repository is not None else configured_repository()

    @asynccontextmanager
    async def lifespan(application: FastAPI) -> AsyncIterator[None]:
        try:
            task_repository.initialize()
            application.state.repository = task_repository
            yield
        finally:
            task_repository.close()

    application = FastAPI(title="Boardlet API", version="1.0.0", lifespan=lifespan)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_methods=["GET", "POST", "PATCH", "DELETE"],
        allow_headers=["Content-Type"],
    )

    @application.exception_handler(RequestValidationError)
    async def invalid_request(request: Request, exc: RequestValidationError) -> JSONResponse:
        messages = []
        for error in exc.errors():
            field = ".".join(str(part) for part in error["loc"] if part not in {"body", "query"})
            messages.append(f"{field}: {error['msg']}" if field else error["msg"])
        return JSONResponse(status_code=422, content={"detail": "; ".join(messages)})

    @application.exception_handler(Exception)
    async def unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled API error", exc_info=exc)
        return JSONResponse(
            status_code=500, content={"detail": "An unexpected server error occurred"}
        )

    @application.get("/api/health", response_model=Health, operation_id="getHealth")
    def health() -> Health:
        return Health(status="ok")

    @application.get(
        "/api/tasks", response_model=TaskPage, operation_id="listTasks", responses=VALIDATION_ERROR
    )
    def list_tasks(
        repository: Repository,
        limit: Annotated[int, Query(ge=1, le=100)] = 100,
        offset: Annotated[int, Query(ge=0)] = 0,
    ) -> TaskPage:
        return repository.list_tasks(limit=limit, offset=offset)

    @application.post(
        "/api/tasks",
        response_model=Task,
        status_code=201,
        operation_id="createTask",
        responses=VALIDATION_ERROR,
    )
    def create_task(data: TaskCreate, repository: Repository) -> Task:
        return repository.create_task(data)

    @application.get(
        "/api/tasks/{task_id}", response_model=Task, operation_id="getTask", responses=TASK_ERRORS
    )
    def get_task(task_id: UUID, repository: Repository) -> Task:
        task = repository.get_task(task_id)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        return task

    @application.patch(
        "/api/tasks/{task_id}",
        response_model=Task,
        operation_id="updateTask",
        responses=TASK_ERRORS,
    )
    def update_task(task_id: UUID, data: TaskUpdate, repository: Repository) -> Task:
        task = repository.update_task(task_id, data)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        return task

    @application.delete(
        "/api/tasks/{task_id}", status_code=204, operation_id="deleteTask", responses=TASK_ERRORS
    )
    def delete_task(task_id: UUID, repository: Repository) -> Response:
        if not repository.delete_task(task_id):
            raise HTTPException(status_code=404, detail="Task not found")
        return Response(status_code=204)

    return application


app = create_app()
