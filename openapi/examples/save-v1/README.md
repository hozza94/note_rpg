# Save API v1 — 예시 페이로드

Mock 서버·테스트·문서 스냅샷용 예시 JSON입니다.  
실제 배포 URL은 환경별로 다르므로 `Docs/plans/deploy_process_1.md`를 참고하세요.

| 파일 | 용도 |
|------|------|
| `get-save-200.json` | `GET /api/v1/save` 성공 응답 본문 |
| `post-save-request.json` | `POST /api/v1/save` 요청 본문 |
| `post-save-200.json` | `POST /api/v1/save` 성공 응답 |
| `post-migrate-request.json` | `POST /api/v1/save/migrate` 요청 |
| `post-migrate-200.json` | `POST /api/v1/save/migrate` 성공 응답 |
| `get-snapshots-200.json` | `GET /api/v1/save/snapshots` 성공 응답 |
| `post-restore-request.json` | `POST /api/v1/save/restore` 요청 |
| `post-restore-200.json` | `POST /api/v1/save/restore` 성공 응답 |
| `error-unauthorized.json` | `401` 공통 형식 |
| `error-version-conflict.json` | `409` 저장 버전 충돌 |
