# API 명세서 1 — 저장/로드/마이그레이션 (T10-02)

본 문서는 `Docs/tasks/task_10.md`의 **T10-02 (저장/로드 API 초안 구현)**을 위한 계약서 초안이다.  
`Docs/specs/data_model_15.md`의 저장 스키마를 기반으로 한다.

---

## 1. 공통 규칙

- Base URL: `/api/v1`
- 인증: `Authorization: Bearer <access_token>`
- 포맷: `application/json`
- 시간: ISO-8601 UTC 문자열
- 숫자 소수 재화(`talent`)는 문자열/decimal 허용 (서버는 decimal로 저장)

공통 응답 헤더:

- `X-Request-Id`: 요청 추적 ID
- `X-Server-Version`: 서버 배포 버전

---

## 2. 에러 응답 형식

```json
{
  "ok": false,
  "error": {
    "code": "SAVE_VERSION_CONFLICT",
    "message": "클라이언트 저장 버전이 서버 버전보다 낮습니다.",
    "details": {}
  },
  "requestId": "req_123"
}
```

주요 에러 코드:

- `UNAUTHORIZED`
- `FORBIDDEN`
- `VALIDATION_FAILED`
- `SAVE_VERSION_CONFLICT`
- `SAVE_INTEGRITY_FAILED`
- `MIGRATION_FAILED`
- `RATE_LIMITED`
- `INTERNAL_ERROR`

---

## 3. 엔드포인트 목록

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/save` | 현재 유저 저장 데이터 조회 |
| `POST` | `/save` | 현재 유저 저장 데이터 저장(업서트) |
| `POST` | `/save/migrate` | 구버전 저장 데이터를 최신 버전으로 변환 |
| `GET` | `/save/snapshots` | 스냅샷 목록 조회 |
| `POST` | `/save/restore` | 특정 스냅샷으로 복원 |

---

## 4. `GET /save`

현재 유저의 저장 상태 전체를 반환한다.

### Response 200

```json
{
  "ok": true,
  "data": {
    "userId": "u_123",
    "saveDataVersion": 3,
    "profile": {
      "nickname": "순례자",
      "title": "Pilgrim",
      "level": 12,
      "exp": 455,
      "bonusPoints": 3
    },
    "currencies": {
      "gold": 12050,
      "talent": "12.3500"
    },
    "inventory": [
      { "itemId": "gray_dust", "count": 45 },
      { "itemId": "iron_sword", "count": 1 }
    ],
    "equipment": {
      "weapon": "iron_sword",
      "armor": null
    },
    "skills": [
      { "skillTreeId": "pilgrim", "nodeId": "node_smite_1", "unlocked": true }
    ],
    "relics": {
      "owned": [
        { "relicId": "relic_ashen_rosary", "level": 3, "isEquipped": true }
      ],
      "gachaPity": { "premiumWithoutEpic": 4 }
    },
    "progress": {
      "currentRegionId": "gihon",
      "questProgress": 42.5,
      "highestRegionId": "gihon"
    },
    "settings": {
      "avatarId": "avatar_pilgrim_default",
      "autoExplore": false,
      "autoBattle": false
    },
    "updatedAt": "2026-04-15T12:34:56.000Z"
  },
  "requestId": "req_abc"
}
```

### 상태 코드

- `200` 성공
- `401` 인증 실패
- `404` 저장 데이터 없음(신규 유저)

---

## 5. `POST /save`

저장 상태를 서버에 업서트한다.  
재화/아이템/장착/성물의 무결성 검사를 수행한다.

### Request Body

```json
{
  "saveDataVersion": 3,
  "profile": {
    "nickname": "순례자",
    "title": "Pilgrim",
    "level": 12,
    "exp": 455,
    "bonusPoints": 3
  },
  "currencies": {
    "gold": 12050,
    "talent": "12.3500"
  },
  "inventory": [
    { "itemId": "gray_dust", "count": 45 },
    { "itemId": "iron_sword", "count": 1 }
  ],
  "equipment": {
    "weapon": "iron_sword",
    "armor": null
  },
  "skills": [
    { "skillTreeId": "pilgrim", "nodeId": "node_smite_1", "unlocked": true }
  ],
  "relics": {
    "owned": [
      { "relicId": "relic_ashen_rosary", "level": 3, "isEquipped": true }
    ],
    "gachaPity": { "premiumWithoutEpic": 4 }
  },
  "progress": {
    "currentRegionId": "gihon",
    "questProgress": 42.5,
    "highestRegionId": "gihon"
  },
  "settings": {
    "avatarId": "avatar_pilgrim_default",
    "autoExplore": false,
    "autoBattle": false
  },
  "clientMeta": {
    "clientBuild": "2026.04.15-1",
    "platform": "web"
  }
}
```

### Response 200

```json
{
  "ok": true,
  "data": {
    "saved": true,
    "saveDataVersion": 3,
    "updatedAt": "2026-04-15T12:35:10.000Z"
  },
  "requestId": "req_def"
}
```

### 상태 코드

- `200` 저장 성공
- `400` 유효성 실패 (`VALIDATION_FAILED`)
- `401` 인증 실패
- `409` 버전 충돌 (`SAVE_VERSION_CONFLICT`)
- `422` 무결성 실패 (`SAVE_INTEGRITY_FAILED`)

### 서버 검증 규칙 (필수)

- 재화 음수 금지
- 아이템 수량 음수 금지
- 장착 아이템은 실제 인벤토리 보유 아이템이어야 함
- 성물 `isEquipped=true`는 1개만 허용
- `saveDataVersion` 역행 금지

---

## 6. `POST /save/migrate`

구버전 저장 데이터 payload를 최신 버전으로 변환한다.

### Request Body

```json
{
  "fromVersion": 1,
  "payload": {
    "profile": {},
    "currencies": {},
    "inventory": []
  }
}
```

### Response 200

```json
{
  "ok": true,
  "data": {
    "fromVersion": 1,
    "toVersion": 3,
    "appliedMigrations": [
      "migrate_v1_to_v2",
      "migrate_v2_to_v3"
    ],
    "payload": {}
  },
  "requestId": "req_mig"
}
```

### 상태 코드

- `200` 변환 성공
- `400` 입력 오류
- `422` 변환 실패 (`MIGRATION_FAILED`)

---

## 7. `GET /save/snapshots`

백업 스냅샷 목록을 최신순으로 조회한다.

### Query

- `limit` (기본 20, 최대 100)

### Response 200

```json
{
  "ok": true,
  "data": {
    "snapshots": [
      {
        "snapshotId": "snap_001",
        "saveDataVersion": 3,
        "createdAt": "2026-04-15T12:00:00.000Z"
      }
    ]
  },
  "requestId": "req_snap"
}
```

---

## 8. `POST /save/restore`

특정 스냅샷 상태로 복원한다.

### Request Body

```json
{
  "snapshotId": "snap_001"
}
```

### Response 200

```json
{
  "ok": true,
  "data": {
    "restored": true,
    "saveDataVersion": 3,
    "updatedAt": "2026-04-15T13:00:00.000Z"
  },
  "requestId": "req_restore"
}
```

### 상태 코드

- `200` 복원 성공
- `404` 스냅샷 없음
- `409` 복원 충돌

---

## 9. 로깅 연동 규칙

각 엔드포인트에서 최소 아래 이벤트를 발행한다.

- `save.load.success` / `save.load.failed`
- `save.write.success` / `save.write.failed`
- `save.migrate.success` / `save.migrate.failed`
- `save.restore.success` / `save.restore.failed`

필수 로그 필드:

- `requestId`, `userId`, `event`, `result`, `saveDataVersion`, `latencyMs`

---

## 10. 레이트리밋/보안 정책

- `POST /save`: 유저당 분당 30회
- `POST /save/migrate`: 유저당 분당 10회
- `POST /save/restore`: 유저당 분당 5회

보안:

- 모든 write API는 인증 필수
- 서버 측 무결성 검증 실패는 반드시 감사 로그 기록

---

## 11. 다음 작업

1. OpenAPI: `openapi/save-v1.yaml` (생성 완료)
2. 예시 페이로드: `openapi/examples/save-v1/` (Mock·테스트용)
3. 실제 배포 URL·DNS·HTTPS 흐름: `Docs/plans/deploy_process_1.md`
4. `T10-04` 공통 로거 미들웨어 구현
5. `T10-10` 마이그레이션 함수 스켈레톤 작성

---

## 변경 이력

- **1판**: 저장/로드/마이그레이션 API 초안 작성.
- **2판**: OpenAPI YAML·예시 JSON·배포 프로세스 문서와 연결.

