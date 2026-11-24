import json
import logging
import time
from contextlib import contextmanager
from contextvars import ContextVar, Token
from typing import Iterator
from uuid import uuid4


_logger = logging.getLogger("smartassist.performance")
_logger.setLevel(logging.INFO)
_logger.propagate = False
if not _logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter("%(message)s"))
    _logger.addHandler(_handler)
_request_context: ContextVar[dict[str, str] | None] = ContextVar(
    "smartassist_performance_request_context",
    default=None,
)


def begin_request(flow: str) -> tuple[str, Token[dict[str, str] | None]]:
    request_id = uuid4().hex
    token = _request_context.set({
        "request_id": request_id,
        "flow": flow,
        "language": "unknown",
    })
    return request_id, token


def set_request_language(language: str) -> None:
    context = _request_context.get()
    if context is not None:
        _request_context.set({**context, "language": language})


def reset_request(token: Token[dict[str, str] | None]) -> None:
    _request_context.reset(token)


def start_timer() -> float:
    return time.perf_counter()


def elapsed_ms(started_at: float) -> float:
    return (time.perf_counter() - started_at) * 1000


def record_timing(
    stage: str,
    duration_ms: float,
    *,
    outcome: str = "success",
    provider: str | None = None,
    flow: str | None = None,
    language: str | None = None,
) -> None:
    context = _request_context.get() or {}
    event = {
        "event": "ai_performance",
        "request_id": context.get("request_id"),
        "flow": flow or context.get("flow", "unknown"),
        "language": language or context.get("language", "unknown"),
        "stage": stage,
        "duration_ms": round(max(duration_ms, 0), 3),
        "outcome": outcome,
    }
    if provider:
        event["provider"] = provider
    _logger.info("%s", json.dumps(event, separators=(",", ":")))


@contextmanager
def timed_stage(
    stage: str,
    *,
    provider: str | None = None,
    flow: str | None = None,
    language: str | None = None,
) -> Iterator[None]:
    started_at = start_timer()
    outcome = "success"
    try:
        yield
    except Exception:
        outcome = "error"
        raise
    finally:
        record_timing(
            stage,
            elapsed_ms(started_at),
            outcome=outcome,
            provider=provider,
            flow=flow,
            language=language,
        )


class DurationAccumulator:
    def __init__(self) -> None:
        self.duration_ms = 0.0

    @contextmanager
    def measure(self) -> Iterator[None]:
        started_at = start_timer()
        try:
            yield
        finally:
            self.duration_ms += elapsed_ms(started_at)

    def record(
        self,
        stage: str,
        *,
        outcome: str = "success",
        flow: str | None = None,
        language: str | None = None,
    ) -> None:
        record_timing(
            stage,
            self.duration_ms,
            outcome=outcome,
            flow=flow,
            language=language,
        )
