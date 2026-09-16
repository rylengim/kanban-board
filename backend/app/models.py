from datetime import datetime
from enum import StrEnum
from typing import Annotated, Literal, Self
from uuid import UUID

from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)
from pydantic.json_schema import SkipJsonSchema


def trimmed_title(value: str) -> str:
    title = value.strip()
    if not title:
        raise ValueError("title must contain at least one non-whitespace character")
    return title


type TitleInput = Annotated[
    str,
    Field(strict=True, min_length=1, max_length=120, pattern=r"\S"),
    AfterValidator(trimmed_title),
]
type Description = Annotated[str, Field(strict=True, max_length=2000)]


class TaskStatus(StrEnum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class TaskPriority(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class APIModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class TaskCreate(APIModel):
    title: TitleInput
    description: Description = ""
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM


def update_schema(schema: dict) -> None:
    # Absent fields are preserved; None is an internal sentinel, never an API default.
    schema["minProperties"] = 1
    for field in schema["properties"].values():
        field.pop("default", None)


class TaskUpdate(APIModel):
    model_config = ConfigDict(extra="forbid", json_schema_extra=update_schema)

    title: TitleInput | SkipJsonSchema[None] = None
    description: Description | SkipJsonSchema[None] = None
    status: TaskStatus | SkipJsonSchema[None] = None
    priority: TaskPriority | SkipJsonSchema[None] = None

    @field_validator("title", "description", "status", "priority", mode="before")
    @classmethod
    def reject_null(cls, value: object) -> object:
        if value is None:
            raise ValueError("must not be null")
        return value

    @model_validator(mode="after")
    def require_change(self) -> Self:
        if not self.model_fields_set:
            raise ValueError("at least one editable field is required")
        return self


class Task(APIModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    id: UUID
    title: Annotated[str, Field(min_length=1, max_length=120, pattern=r"^\S(?:[\s\S]*\S)?$")]
    description: Description
    status: TaskStatus
    priority: TaskPriority
    created_at: datetime
    updated_at: datetime


class TaskPage(APIModel):
    items: Annotated[list[Task], Field(max_length=100)]
    total: Annotated[int, Field(ge=0)]


class Health(APIModel):
    status: Literal["ok"]


class Error(APIModel):
    detail: str
