# 로그 설계서 1

본 문서는 `note_rpg` 서비스 운영을 위한 로그 수집 기준을 정의한다.  
핵심 원칙은 **장애 대응**, **보안 감사**, **경제 밸런스 분석**에 필요한 정보만 구조적으로 남기는 것이다.

---

## 1. 로그 설계 목표

- 장애 발생 시 원인과 영향 범위를 빠르게 파악한다.
- 비정상 재화 증가, 치트 의심 행동, 운영자 오조작을 추적 가능하게 만든다.
- 배포 버전/지역/기능 단위로 문제 발생률을 비교할 수 있게 한다.

---

## 2. 로그 카테고리

## 2.1 애플리케이션 로그 (App Log)

- 대상: API 요청 처리, 예외, 저장/로드 실패, 외부 의존성 오류
- 목적: 장애 탐지 및 디버깅

## 2.2 감사 로그 (Audit Log)

- 대상: 운영자 액션(재화 조정, 계정 제재, 강제 복구)
- 목적: 책임 추적, 보안 감사

## 2.3 게임 이벤트 로그 (Game Event Log)

- 대상: 전투 결과, 보상 지급, 가챠, 강화/분해/제작, 상점 거래
- 목적: 밸런스 분석, 악용 탐지

---

## 3. 공통 로그 스키마

모든 로그는 JSON 단일 라인 형태를 기본으로 한다.

```json
{
  "ts": "2026-04-15T12:34:56.000Z",
  "level": "info",
  "service": "note_rpg_api",
  "env": "prod",
  "version": "2026.04.15-1",
  "requestId": "req_xxx",
  "userId": "u_12345",
  "sessionId": "s_abc",
  "event": "battle.completed",
  "result": "success",
  "regionId": "gihon",
  "meta": {}
}
```

필수 필드:

- `ts`, `level`, `service`, `env`, `version`
- `requestId`, `event`, `result`
- `userId` (비로그인 이벤트는 null 허용)

권장 필드:

- `sessionId`, `regionId`, `battleId`, `clientBuild`

---

## 4. 무엇을 기록할지 (이벤트 목록)

## 4.1 인증/계정

- `auth.login.success` / `auth.login.failed`
- `auth.register.success` / `auth.register.failed`
- `auth.token.refresh`
- 실패 사유 코드(`reasonCode`)는 저장, 비밀번호 원문은 금지

## 4.2 저장/로드

- `save.started`, `save.completed`, `save.failed`
- `load.completed`, `load.failed`
- `migration.applied` (이전 버전 → 현재 버전)

## 4.3 전투

### 권장 결론

- **전투 전체 원문 로그(턴별 텍스트) 전부 저장은 비권장**
- 대신 아래와 같이 **요약 이벤트 중심**으로 저장

핵심 이벤트:

- `battle.started`
- `battle.completed`
- `battle.reward.granted`
- `battle.escape.attempted`

`battle.completed.meta` 권장 필드:

- `battleType` (`field`, `boss`, `dungeon`)
- `enemyId`, `enemyTier`, `enemyGrade`
- `turnCount`
- `result` (`win`, `lose`, `escape`)
- `playerHpBefore`, `playerHpAfter`
- `damageDealtTotal`, `damageTakenTotal`
- `usedSkillIds` (요약 배열)

`battle.reward.granted.meta` 권장 필드:

- `exp`, `gold`, `talent`, `dropItemIds`, `relicGachaPityAfter`

> 참고: 전투 상세 분석이 필요하면 샘플링(예: 1~5%)만 턴 단위 상세 로그를 저장한다.

## 4.4 경제(재화/아이템)

- `economy.currency.changed`
  - `currencyType` (`gold`, `talent`)
  - `delta`, `before`, `after`, `reason`
- `economy.item.changed`
  - `itemId`, `delta`, `before`, `after`, `reason`

## 4.5 시설 기능

- `shop.purchase`
- `shop.sell`
- `smith.enhance.attempted` / `smith.enhance.completed`
- `smith.salvage.single`
- `smith.salvage.bulk`
- `smith.craft.completed`
- `relic.gacha.pull`

## 4.6 운영자 액션

- `admin.user.currency.adjusted`
- `admin.user.item.adjusted`
- `admin.user.banned` / `admin.user.unbanned`

감사 필드:

- `adminId`, `targetUserId`, `reason`, `ticketId`, `before`, `after`

---

## 5. 보안/개인정보 규칙

- 비밀번호, 토큰 원문, 결제 민감값 저장 금지
- IP는 필요한 경우 일부 마스킹 저장
- 로그 조회 권한 분리 (운영/개발/보안)
- 감사 로그는 수정 불가 스토리지(append-only) 보관 권장

---

## 6. 저장/보관 정책

- App Log: 30일
- Game Event Log: 90일
- Audit Log: 1년 이상 권장

압축/아카이브:

- 7일 경과 로그는 저비용 스토리지로 이동
- 장기 분석용 집계 테이블(일 단위) 별도 유지

---

## 7. 알람 규칙 (초기안)

- `save.failed` 비율 5분 평균 2% 초과
- `auth.login.failed` 급증 (봇 공격 의심)
- `economy.currency.changed` 이상치 (단일 요청 고액 증가)
- `battle.completed` 성공률 급락 (밸런스/버그 의심)

---

## 8. 구현 순서 (권장)

1. 공통 로거 래퍼 구현 (`requestId`, `version`, `userId` 자동 주입)
2. 인증/저장/로드 로그부터 우선 적용
3. 전투는 `started/completed/reward` 요약 로그 적용
4. 경제 변경 이벤트 단일 진입점에서 공통 로깅
5. 운영자 감사 로그 및 대시보드 연동

---

## 9. 점검 체크리스트

- [ ] 이벤트 이름 규칙이 통일되어 있는가
- [ ] 모든 재화 변경 이벤트에 `before/after/delta/reason`이 있는가
- [ ] 전투 로그가 과도하게 저장되지 않는가 (요약/샘플링 적용)
- [ ] 민감정보 마스킹이 적용되어 있는가
- [ ] 알람 임계치가 운영 기준과 맞는가

---

## 변경 이력

- **1판**: 초기 운영 로그 설계 수립 (전투 포함).

