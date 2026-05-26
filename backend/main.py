from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import api, auth

app = FastAPI(title='WaitlistForCreators API', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth.router)
app.include_router(api.router)


@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}
