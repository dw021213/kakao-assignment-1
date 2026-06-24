import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Boolean, Column, Integer, String, create_engine, text
from sqlalchemy.orm import Session, declarative_base, sessionmaker

# .env.local에서 DB 주소 같은 환경값을 읽어와요.
load_dotenv(".env.local")

# ---- DB 설정 ----
# 환경변수가 없으면 같은 폴더의 todos.db 파일을 기본으로 써요.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todos.db")
# SQLite는 기본적으로 한 스레드에서만 쓰게 막혀 있어서, FastAPI에서 쓰려면 이 옵션을 풀어줘요.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ---- DB 모델 (실제 테이블 모양) ----
class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
    # 어느 날짜의 할 일인지 "YYYY-MM-DD" 문자열로 저장해요. (2차의 일간/주간 뷰를 옮겨오기 위함)
    date = Column(String, nullable=True)


# ---- Pydantic 스키마 (요청/응답에서 쓰는 데이터 모양) ----
# DB 모델과 따로 두는 이유: 생성할 때는 id가 필요 없고,
# 응답할 때는 id까지 같이 내려줘야 해서 모양이 서로 달라요.
class TodoCreate(BaseModel):
    title: str
    date: Optional[str] = None


class TodoUpdate(BaseModel):
    # 수정은 제목만, 완료여부만, 날짜만 따로 바꿀 수도 있어서 모두 선택값으로 둬요.
    title: Optional[str] = None
    completed: Optional[bool] = None
    date: Optional[str] = None


class TodoResponse(BaseModel):
    id: int
    title: str
    completed: bool
    date: Optional[str] = None

    # SQLAlchemy 객체(.id, .title ...)를 그대로 받아 JSON으로 바꿔주는 설정이에요.
    model_config = {"from_attributes": True}


# 앱이 처음 켜질 때 테이블이 없으면 만들어줘요.
Base.metadata.create_all(bind=engine)

# 예전 버전 DB(todos 테이블은 있는데 date 컬럼만 없는 경우)를 위해 컬럼을 더해줘요.
# 이미 있으면 에러가 나니까 조용히 무시해요.
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE todos ADD COLUMN date VARCHAR"))
        conn.commit()
    except Exception:
        pass

app = FastAPI(title="Todo API")

# 프론트(localhost:3000)에서 보낸 요청을 브라우저가 막지 않도록 CORS를 열어줘요.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# 요청마다 DB 세션을 하나 열고, 끝나면 닫아주는 의존성이에요.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/todos", response_model=list[TodoResponse])
def read_todos(
    filter: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    # 상태 필터와 검색은 클라이언트가 아니라 여기(서버)에서 DB 조건으로 처리해요.
    query = db.query(Todo)
    if filter == "active":
        query = query.filter(Todo.completed == False)  # noqa: E712
    elif filter == "completed":
        query = query.filter(Todo.completed == True)  # noqa: E712
    if search:
        # 제목에 검색어가 들어간 항목만 골라요. (대소문자 구분 없이)
        query = query.filter(Todo.title.ilike(f"%{search}%"))
    return query.all()


@app.post("/todos", response_model=TodoResponse, status_code=201)
def create_todo(payload: TodoCreate, db: Session = Depends(get_db)):
    todo = Todo(title=payload.title, completed=False, date=payload.date)
    db.add(todo)
    db.commit()
    db.refresh(todo)  # DB가 매겨준 id를 다시 읽어와요.
    return todo


@app.get("/todos/{todo_id}", response_model=TodoResponse)
def read_todo(todo_id: int, db: Session = Depends(get_db)):
    # 수정 페이지에서 Todo 하나를 불러올 때 써요.
    todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="해당 Todo를 찾을 수 없어요.")
    return todo


@app.put("/todos/{todo_id}", response_model=TodoResponse)
def update_todo(todo_id: int, payload: TodoUpdate, db: Session = Depends(get_db)):
    todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="해당 Todo를 찾을 수 없어요.")
    # 보내준 값만 바꿔요. (제목만 수정하면 완료여부·날짜는 그대로 둬요)
    if payload.title is not None:
        todo.title = payload.title
    if payload.completed is not None:
        todo.completed = payload.completed
    if payload.date is not None:
        todo.date = payload.date
    db.commit()
    db.refresh(todo)
    return todo


@app.delete("/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="해당 Todo를 찾을 수 없어요.")
    db.delete(todo)
    db.commit()
