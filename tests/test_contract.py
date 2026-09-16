from pathlib import Path
from uuid import uuid4

import pytest
import yaml
from jsonschema import Draft202012Validator, FormatChecker

CONTRACT = yaml.safe_load((Path(__file__).parents[1] / "openapi.yaml").read_text())
METHODS = {"get", "post", "patch", "delete", "put", "options", "head"}
ANNOTATIONS = {"title", "description", "example", "examples"}


def resolved(value, document):
    if isinstance(value, list):
        return [resolved(item, document) for item in value]
    if not isinstance(value, dict):
        return value
    if "$ref" in value:
        target = document
        for part in value["$ref"].removeprefix("#/").split("/"):
            target = target[part]
        value = {**target, **{key: item for key, item in value.items() if key != "$ref"}}
    return {key: resolved(item, document) for key, item in value.items()}


def schema_constraints(value):
    """Ignore descriptive annotations; retain every validation keyword and default."""
    if isinstance(value, list):
        return [schema_constraints(item) for item in value]
    if not isinstance(value, dict):
        return value
    result = {}
    for key, item in value.items():
        if key in ANNOTATIONS:
            continue
        if key == "properties":
            result[key] = {name: schema_constraints(field) for name, field in item.items()}
        elif key in {"required", "enum"} and isinstance(item, list):
            result[key] = sorted(item)
        else:
            result[key] = schema_constraints(item)
    return result


def operations(document):
    return {
        (path, method): operation
        for path, entry in document["paths"].items()
        for method, operation in entry.items()
        if method in METHODS
    }


def parameter_constraints(document, path, operation):
    parameters = [*document["paths"][path].get("parameters", []), *operation.get("parameters", [])]
    return {
        (parameter["in"], parameter["name"]): {
            "required": parameter.get("required", False),
            "schema": schema_constraints(resolved(parameter["schema"], document)),
        }
        for parameter in parameters
    }


def test_generated_openapi_operations_and_schemas_match_written_contract(client):
    # This calls FastAPI's real generator: the application never reads openapi.yaml.
    generated = client.get("/openapi.json").json()
    expected_operations = operations(CONTRACT)
    actual_operations = operations(generated)
    assert actual_operations.keys() == expected_operations.keys()
    for (path, method), expected in expected_operations.items():
        actual = actual_operations[path, method]
        assert actual["operationId"] == expected["operationId"]
        assert parameter_constraints(generated, path, actual) == parameter_constraints(
            CONTRACT, path, expected
        )
        expected_body = resolved(expected.get("requestBody"), CONTRACT)
        actual_body = resolved(actual.get("requestBody"), generated)
        assert schema_constraints(actual_body) == schema_constraints(expected_body)
        assert actual["responses"].keys() == expected["responses"].keys()
        for status, response in expected["responses"].items():
            expected_response = resolved(response, CONTRACT)
            actual_response = resolved(actual["responses"][status], generated)
            assert schema_constraints(actual_response) == schema_constraints(expected_response)


def validate_response(response, path, method):
    operation = CONTRACT["paths"][path][method]
    specification = resolved(operation["responses"][str(response.status_code)], CONTRACT)
    if "content" not in specification:
        assert response.content == b""
        return
    assert response.headers["content-type"].startswith("application/json")
    schema = specification["content"]["application/json"]["schema"]
    Draft202012Validator(schema, format_checker=FormatChecker()).validate(response.json())


def test_actual_crud_responses_validate_against_written_contract(client):
    validate_response(client.get("/api/health"), "/api/health", "get")
    created = client.post("/api/tasks", json={"title": "Contract example", "priority": "high"})
    assert created.status_code == 201
    validate_response(created, "/api/tasks", "post")
    path = f"/api/tasks/{created.json()['id']}"
    validate_response(client.get("/api/tasks"), "/api/tasks", "get")
    validate_response(client.get(path), "/api/tasks/{task_id}", "get")
    validate_response(client.patch(path, json={"status": "done"}), "/api/tasks/{task_id}", "patch")
    validate_response(client.delete(path), "/api/tasks/{task_id}", "delete")


@pytest.mark.parametrize(
    ("method", "path", "body"),
    [
        ("post", "/api/tasks", {"title": ""}),
        ("get", "/api/tasks?limit=0", None),
        ("get", "/api/tasks/not-a-uuid", None),
        ("patch", "/api/tasks/not-a-uuid", {"status": "done"}),
        ("delete", "/api/tasks/not-a-uuid", None),
        ("get", f"/api/tasks/{uuid4()}", None),
        ("patch", f"/api/tasks/{uuid4()}", {"status": "done"}),
        ("delete", f"/api/tasks/{uuid4()}", None),
    ],
)
def test_actual_error_responses_validate_against_written_contract(client, method, path, body):
    kwargs = {"json": body} if body is not None else {}
    response = client.request(method, path, **kwargs)
    assert response.status_code in {404, 422}
    contract_path = "/api/tasks/{task_id}" if path.startswith("/api/tasks/") else "/api/tasks"
    validate_response(response, contract_path, method)


def test_contract_examples_validate():
    document = resolved(CONTRACT, CONTRACT)

    def visit(value):
        if isinstance(value, list):
            for item in value:
                visit(item)
        elif isinstance(value, dict):
            if "schema" in value and "example" in value:
                Draft202012Validator(value["schema"], format_checker=FormatChecker()).validate(
                    value["example"]
                )
            if "type" in value:
                for example in value.get("examples", []):
                    Draft202012Validator(value, format_checker=FormatChecker()).validate(example)
            for item in value.values():
                visit(item)

    visit(document)
