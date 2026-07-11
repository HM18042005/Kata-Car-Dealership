import os
from math import isfinite

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import auth, orders, vehicles


load_dotenv()
app = FastAPI(title="Car Dealership Inventory API")


def _json_safe(value):
    if isinstance(value, float) and not isfinite(value):
        return str(value)
    if isinstance(value, dict):
        return {key: _json_safe(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [_json_safe(item) for item in value]
    return value


@app.exception_handler(RequestValidationError)
def validation_error_handler(_, error: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": _json_safe(jsonable_encoder(error.errors()))},
    )


origins = ["http://localhost:5173"]
if deployed_origin := os.getenv("CORS_ORIGIN"):
    origins.append(deployed_origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(orders.router)
app.include_router(vehicles.router)
