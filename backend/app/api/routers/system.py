from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def root() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/v1/models")
def models() -> dict[str, str]:
    return {"status": "ok"}
