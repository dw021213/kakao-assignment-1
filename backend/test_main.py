"""백엔드 API 자동 테스트.

실제 todos.db를 건드리지 않도록, 테스트는 메모리 SQLite를 따로 써요.
실행: backend 폴더에서 `pytest`
"""

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import Base, app, get_db

# 테스트 전용 인메모리 DB (StaticPool로 한 연결을 공유해서 테이블이 유지돼요)
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# 앱이 요청마다 쓰는 DB를 테스트용 DB로 바꿔치기해요.
app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def setup_function():
    # 각 테스트 시작 전에 테이블을 비워 깨끗한 상태에서 시작해요.
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_생성하고_조회한다():
    res = client.post("/todos", json={"title": "장보기", "date": "2026-06-24"})
    assert res.status_code == 201
    body = res.json()
    assert body["title"] == "장보기"
    assert body["completed"] is False
    assert body["date"] == "2026-06-24"  # date가 저장·응답된다
    assert "id" in body

    assert len(client.get("/todos").json()) == 1


def test_상태별_필터링한다():
    client.post("/todos", json={"title": "할일A", "date": "2026-06-24"})
    b = client.post("/todos", json={"title": "할일B", "date": "2026-06-24"}).json()
    client.put(f"/todos/{b['id']}", json={"completed": True})

    active = client.get("/todos", params={"filter": "active"}).json()
    assert [t["title"] for t in active] == ["할일A"]

    completed = client.get("/todos", params={"filter": "completed"}).json()
    assert [t["title"] for t in completed] == ["할일B"]


def test_제목으로_검색한다():
    client.post("/todos", json={"title": "병원 예약", "date": "2026-06-24"})
    client.post("/todos", json={"title": "운동 하기", "date": "2026-06-24"})

    found = client.get("/todos", params={"search": "병원"}).json()
    assert len(found) == 1
    assert found[0]["title"] == "병원 예약"


def test_수정하면_보낸_필드만_바뀐다():
    a = client.post("/todos", json={"title": "원래제목", "date": "2026-06-24"}).json()

    res = client.put(f"/todos/{a['id']}", json={"title": "바뀐제목"})
    assert res.json()["title"] == "바뀐제목"
    # 제목만 보냈으니 date는 그대로 유지돼야 해요.
    assert res.json()["date"] == "2026-06-24"


def test_삭제하면_없어진다():
    a = client.post("/todos", json={"title": "지울거", "date": "2026-06-24"}).json()

    assert client.delete(f"/todos/{a['id']}").status_code == 204
    assert client.get(f"/todos/{a['id']}").status_code == 404
