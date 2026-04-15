## 문서 (/Docs)

1. 계획서·Task 리스트·기능 정의서·명세는 반드시 **한국어**로 작성한다.
2. 모든 설계·작업 기록은 **`/Docs` 이하**에 둔다. 루트에 산발적으로 두지 않는다.
3. 문서는 **역할별 하위 폴더**에 둔다 (신규 작성 시부터 준수):
   - `Docs/plans/` — 배포·리팩터링·로깅·밸런스 등 **계획·기준표** (`*_plan_*.md`, `relic_gacha_balance_*.md`, 배포 절차 문서 등)
   - `Docs/tasks/` — 실행 태스크 (`task.md`, `task_*.md`)
   - `Docs/specs/` — API·데이터 모델·기능 정의 (`api_spec_*.md`, `data_model_*.md`, `features.md`)
   - `Docs/implementation/` — 단계별 구현 계획 (`implementation_plan*.md`)
   - `Docs/guides/` — 워크스루·가이드 (`walkthrough*.md`)
   - `Docs/backlog/` — 백로그·폴리시 메모 (`backlog_*.md`)
4. 같은 주제의 문서가 개정되면 **파일명에 번호**를 붙여 추적한다 (`deploy_plan_1.md` → `deploy_plan_2.md`). Task도 동일 (`task_10.md` 등).
5. 문서 간 상호 링크는 **이동 후 경로**를 유지한다. 루트에 `Docs/README.md` 목차를 둔다.
6. OpenAPI·예시 JSON 등 코드 근처 산출물은 `openapi/` 등 **기존 경로 규칙**을 따르고, 문서에서는 그 경로를 명시해 링크한다.
7. 문서를 이동·이름 변경할 때는 저장소 전체에서 `` `Docs/...` `` 또는 `Docs/...` 문자열을 검색해 상호 링크를 함께 수정한다.