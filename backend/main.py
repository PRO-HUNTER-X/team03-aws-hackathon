from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from src.handlers.auth import handle_login, handle_verify
from src.handlers.admin import handle_get_inquiries, handle_get_inquiry, handle_update_status, handle_dashboard
import json

app = FastAPI(title="CS Chatbot API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def lambda_event_from_request(request: Request, body: str = None):
    """FastAPI Request를 Lambda event 형태로 변환"""
    return {
        'httpMethod': request.method,
        'path': str(request.url.path),
        'queryStringParameters': dict(request.query_params) if request.query_params else None,
        'headers': dict(request.headers),
        'body': body
    }

@app.post("/auth/login")
async def login(request: Request):
    body = await request.body()
    event = lambda_event_from_request(request, body.decode())
    
    try:
        from src.handlers.auth import lambda_handler
        response = lambda_handler(event, None)
        return JSONResponse(
            status_code=response['statusCode'],
            content=json.loads(response['body'])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/auth/verify")
async def verify_token(request: Request):
    event = lambda_event_from_request(request)
    
    try:
        from src.handlers.auth import lambda_handler
        response = lambda_handler(event, None)
        return JSONResponse(
            status_code=response['statusCode'],
            content=json.loads(response['body'])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/dashboard")
async def get_dashboard(request: Request):
    try:
        from src.handlers.admin import handle_dashboard
        headers = {"Content-Type": "application/json"}
        response = handle_dashboard(headers)
        return JSONResponse(
            status_code=response['statusCode'],
            content=json.loads(response['body'])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/inquiries")
async def get_inquiries(request: Request):
    event = lambda_event_from_request(request)
    
    try:
        from src.handlers.admin import handle_get_inquiries
        headers = {"Content-Type": "application/json"}
        response = handle_get_inquiries(event, headers)
        return JSONResponse(
            status_code=response['statusCode'],
            content=json.loads(response['body'])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/inquiries/{inquiry_id}")
async def get_inquiry(inquiry_id: str, request: Request):
    event = lambda_event_from_request(request)
    event['path'] = f"/admin/inquiries/{inquiry_id}"
    
    try:
        from src.handlers.admin import lambda_handler
        response = lambda_handler(event, None)
        return JSONResponse(
            status_code=response['statusCode'],
            content=json.loads(response['body'])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/admin/inquiries/{inquiry_id}/status")
async def update_inquiry_status(inquiry_id: str, request: Request):
    body = await request.body()
    event = lambda_event_from_request(request, body.decode())
    
    try:
        from src.handlers.admin import handle_update_status
        headers = {"Content-Type": "application/json"}
        response = handle_update_status(inquiry_id, event, headers)
        return JSONResponse(
            status_code=response['statusCode'],
            content=json.loads(response['body'])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3002)