# task_8: 보스 던전/보스 전용 레어 드랍 구현

## 목적
- 보스 재도전 루프를 만들고, 보스에서만 나오는 전용 레어 아이템 파밍 동선을 제공한다.

## 체크리스트
- [x] `js/data.js`에 `bossDungeon.entries` 추가
- [x] `js/data.js`에 `bossExclusiveDropTables` 추가
- [x] `js/data.js`에 보스 전용 레어 아이템 정의
- [x] `game.js` 상태에 `bossDungeonUnlocked`, `bossClearHistory`, `bossDropPity` 추가
- [x] 세이브 로드 시 신규 상태 필드 기본값 주입(하위호환)
- [x] `index.html`에 `보스던전` 버튼 및 모달 구조 추가
- [x] `style.css`에 보스 카드/필터/상태 뱃지 스타일 추가
- [x] `game.js`에 보스 리스트 렌더, 필터, 정렬, 도전 이벤트 연결
- [x] `js/engine/battle.js` 승리 처리에 보스 전용 드랍 판정 추가
- [x] `js/engine/battle.js`에 보스별 pity 누적/초기화 로직 추가
- [x] 최초 클리어 보상(1회) 지급 처리 추가
- [x] 로그 문구(전투 진입/레어 획득/최초 클리어) 정리

## 수동 검증
1. 현재 지역 도달 상태에서 보스 던전 오픈 -> 이전 지역 보스 노출 확인
2. 보스 던전에서 보스 선택 후 전투 시작 확인
3. 승리 시 기본 드랍 + 전용 드랍 동시 판정 확인
4. 레어 미획득 반복 후 pity 증가 체감 확인
5. 최초 클리어 1회 보상 중복 지급 방지 확인
6. 저장 후 재접속 시 보스 클리어 기록/누적 pity 유지 확인
