# 문서 인덱스

프로젝트 설계·계획·태스크·명세는 모두 이 디렉터리 아래에 둔다.  
하위 폴더 역할은 `.cursor/rules/rules.md`와 동일하다.

---

## `plans/` — 계획·기준·밸런스

| 문서 | 설명 |
|------|------|
| [deploy_plan_1.md](plans/deploy_plan_1.md) | 대규모 배포 준비 계획 |
| [deploy_process_1.md](plans/deploy_process_1.md) | URL·DNS·HTTPS·배포 파이프라인 실무 |
| [logging_plan_1.md](plans/logging_plan_1.md) | 로그 설계(앱/감사/게임 이벤트) |
| [refactoring_plan_1.md](plans/refactoring_plan_1.md) | 엔진·`game.js` 리팩터링 계획 |
| [relic_gacha_balance_1.md](plans/relic_gacha_balance_1.md) | 성물 가챠 밸런스 기준 |

---

## `tasks/` — 실행 태스크

| 문서 | 설명 |
|------|------|
| [task.md](tasks/task.md) | 초기 태스크 |
| [task_2.md](tasks/task_2.md) ~ [task_9.md](tasks/task_9.md) | 단계별 태스크 |
| [task_10.md](tasks/task_10.md) | 배포·로그 계획 실행 태스크(T10) |

---

## `specs/` — API·데이터·기능 정의

| 문서 | 설명 |
|------|------|
| [features.md](specs/features.md) | 게임 기능·전투 공식 등 |
| [api_spec_1.md](specs/api_spec_1.md) | Save API 계약(저장/로드/마이그레이션) |
| [data_model_14.md](specs/data_model_14.md) | 도메인 의존성·용어 |
| [data_model_15.md](specs/data_model_15.md) | 서버 저장 스키마 초안 |

---

## `implementation/` — 구현 계획 시리즈

`implementation_plan.md`, `implementation_plan_2.md` … `implementation_plan_14.md` — 단계별 구현 설계.

---

## `guides/` — 워크스루

| 문서 | 설명 |
|------|------|
| [walkthrough.md](guides/walkthrough.md) | 진입 가이드 |
| [walkthrough_3.md](guides/walkthrough_3.md), [walkthrough_4.md](guides/walkthrough_4.md) | 추가 워크스루 |

---

## `backlog/` — 백로그

| 문서 | 설명 |
|------|------|
| [backlog_boss_combat_polish.md](backlog/backlog_boss_combat_polish.md) | 보스 전투 폴리시 백로그 |

---

## 코드 근처 산출물 (문서 밖)

- OpenAPI: 저장소 루트 `openapi/save-v1.yaml`
- 예시 JSON: `openapi/examples/save-v1/`
