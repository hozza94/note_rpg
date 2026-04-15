# 구현 계획 6: 장비 아바타 UI + 거미줄 스킬트리

## 1) 구현 범위
- 좌측 캐릭터 패널의 장비 영역을 **아바타 배경 이미지 + 슬롯 오버레이** 방식으로 재구성
- 슬롯 클릭 시 장착/해제 가능한 **장비 관리 모달** 제공
- 스킬트리 모달을 **SVG 거미줄 그래프**로 재구성하고 노드 클릭 해금 연결
- 스킬트리 모달에 **드래그 이동 + 확대/축소(휠/버튼)** 상호작용 추가
- 기존 저장/로드 구조와 호환되도록 기존 `unlockSkillNode`, `canUnlockSkillNode`, `InventoryManager` 흐름 재사용

## 2) 파일별 변경 사항

### `game.js`
- `renderEquipmentPanel()`을 아바타 슬롯 렌더 방식으로 교체
- `getEquipmentSlotConfig()` 추가로 슬롯 위치/라벨/아이콘 정의
- `openEquipmentSlotModal(slot)` 추가로 슬롯 단위 장비 교체 UI 제공
- `openSkillTreeModal()`을 SVG 그래프 렌더 구조로 교체
- `getSkillTreeLayout()`, `getSkillNodeStateLabel()`, `getSkillNodeClass()` 보조 메서드 추가
- 스킬트리 노드 hover 정보 박스 및 클릭 해금 이벤트 연결
- 스킬트리 드래그 팬/휠 줌/버튼 줌 로직 추가

### `style.css`
- 장비 아바타 관련 스타일(`equipment-avatar-*`, `equipment-slot-btn`, `equip-choice-*`) 추가
- 거미줄 스킬트리 스타일(`skill-web-*`) 추가
- 900px 이하 반응형 최소 대응(아바타 슬롯 크기, 스킬 툴바/뷰포트 높이) 추가

### `assets/avatars/pilgrim_avatar.svg`
- 장비 아바타 UI 배경으로 사용할 순례자 기본 실루엣 SVG(아바타 이미지는 `assets/avatars/`에 둠)

### `Docs/features.md`
- 장비 아바타 UI와 거미줄 스킬트리 조작 규칙을 시스템 문서에 반영

## 3) 검증 체크리스트
- [ ] 머리/상체/허리/발/주무기/보조 슬롯 클릭 시 장비 관리 모달이 열린다.
- [ ] 장비 관리 모달에서 장착/해제가 실제 장비 상태 및 능력치에 즉시 반영된다.
- [ ] 인벤토리에서 장착한 결과와 아바타 슬롯 표시가 항상 동기화된다.
- [ ] 스킬트리 모달에서 노드/간선이 거미줄 형태로 렌더링된다.
- [ ] 해금 가능한 노드를 클릭하면 포인트가 소모되고 상태가 즉시 업데이트된다.
- [ ] 스킬트리 모달에서 드래그 팬, 휠 줌, 버튼 줌/초기화가 정상 동작한다.
- [ ] 저장 후 재접속 시 장비 상태/스킬트리 해금 상태가 유지된다.
