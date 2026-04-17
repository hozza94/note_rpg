# 아바타 에셋 경로 리팩터 (1차)

## 목적

- 이미지 경로를 `assets/avatars/` 기준으로 한곳에서 조합해 유지보수·확장을 단순화한다.
- 카탈로그에는 **파일명(`file`)만** 두고, 폴더 이동 시 `basePath` 한 줄만 바꾸면 된다.

## 구조

| 항목 | 설명 |
|------|------|
| `GAME_DATA.avatars.basePath` | 기본 폴더 (예: `assets/avatars/`, 끝에 `/` 필수) |
| `GAME_DATA.avatars.defaultFiles` | 카탈로그에 없을 때 성별 기본 파일 (`male` / `female`) |
| `list[].file` | 해당 아바타 파일명만 (예: `Avatar_M.png`) |
| `window.AvatarAssets` | `resolveAvatarImageUrl(entry)` 등 URL 조합 (레거시 `image` 필드도 호환) |

## 데이터 단일 기준 (중요)

- **`js/data.js`의 `GAME_DATA`가 원본**이다.
- `data/parts/*.json`은 `export-game-data-parts`로 **내보낸 사본**이다.  
  아바타만 바꿀 때도 **먼저 `js/data.js`의 `avatars`를 수정**한 뒤 아래 동기화 명령을 실행하는 것을 권장한다.
- `data/parts/avatars.json`만 직접 고치면 `data.js`와 어긋나고, `verify-data-roundtrip`이 실패한다.

## npm으로 `data/parts` 동기화

저장소 루트에서:

```bash
npm run data:export-parts
```

- `js/data.js`(+ `js/data/constants.js`)를 실행해 `GAME_DATA`를 읽고, `data/parts/` 아래 키별 JSON을 덮어쓴다 (`avatars.json` 포함).

라운드트립 검증 (`data.js` ≡ `data/parts` 병합 결과):

```bash
npm run data:verify-roundtrip
```

내보내기 + 검증을 한 번에:

```bash
npm run data:sync
```

npm을 쓰지 않으면 동일하게:

```bash
node scripts/export-game-data-parts.mjs
node scripts/verify-data-roundtrip.mjs
```

## 아바타 추가·파일명 변경 절차

1. `assets/avatars/`에 이미지 파일 추가(또는 파일명 변경).
2. **`js/data.js`**의 `avatars.list`에 항목 추가 또는 해당 항목의 `file`만 수정.
3. `npm run data:export-parts` (또는 `npm run data:sync`).
4. `index.html`에서 `js/data.js` 쿼리 버전(`?v=...`)을 올릴 필요가 있으면 올린다.

## 관련 파일

- `package.json` — `data:export-parts`, `data:verify-roundtrip`, `data:sync` 스크립트
- `scripts/export-game-data-parts.mjs` — `GAME_DATA` → `data/parts/*.json`
- `scripts/verify-data-roundtrip.mjs` — `data.js`와 `data/parts` 일치 검증
- `scripts/validate-game-data.mjs` — `avatars.file` 등 규칙 검증 (별도 실행)
- `js/engine/avatar-assets.js` — 경로 조합 모듈
- `js/engine/ui-avatar-equipment.js` — `getAvatarImagePath()`에서 `AvatarAssets` 사용
