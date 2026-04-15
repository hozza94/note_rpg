# GitHub Pages 배포·세이브 연동 설계 1

무료 정적 호스팅(GitHub Pages)으로 클라이언트를 배포할 때의 구성과, **현재 코드 기준** 세이브·백업이 어떻게 동작하는지 정리한다.

---

## 1. 전제 (현재 아키텍처)

- 게임 본체는 **정적 파일** (`index.html`, `js/`, `style.css`, `assets/`).
- 세이브·계정·백업 슬롯은 **`localStorage`** 기반 (`js/storage.js`).
- 이른바 “클라우드 백업”은 **별도 서버 없이 동일 브라우저의 `localStorage`에 슬롯별로 복제**하는 형태다. (`StorageManager.syncToCloudSlot` 등)

따라서 **백엔드 서버 없이** GitHub Pages만으로도 **플레이·저장·슬롯 백업·JSON 파일 내보내기/가져오기**까지 동작한다.

---

## 2. GitHub Pages 구성 절차 (요약)

1. 저장소 **Settings → Pages** 에서 Source 선택  
   - **Deploy from a branch**: `main` 또는 `cursor` 등 배포할 브랜치, 폴더 `/ (root)` 권장.
2. 첫 배포 후 사이트 URL 확인  
   - 사용자/조직 페이지: `https://<user>.github.io/<repo>/`
3. **상대 경로**로 스크립트·CSS·이미지를 불러오므로, **프로젝트 루트가 사이트 루트로 서빙**되면 추가 빌드 없이 동작한다.
4. (선택) **Custom domain**: DNS `CNAME` / `A` 레코드 설정 후 Pages에 도메인 등록, HTTPS는 GitHub가 인증서 처리.

---

## 3. 세이브 데이터와 “출처(origin)”

| 항목 | 설명 |
|------|------|
| 메인 세이브 | 로그인 사용자별 `localStorage` 키 (`BASILEIA_SAVE_<user>`) |
| 백업 슬롯 1~3 | `BASILEIA_CLOUD_<user>_SLOT_*` 형태로 **같은 origin**에 저장 |
| 파일 백업 | 백업 매니저의 “현재 진행 파일 저장” / 슬롯 “파일 저장”으로 **JSON 다운로드** |
| 파일 복원 | “파일에서 복원”으로 JSON 업로드 |

**주의:** `http://localhost`와 `https://<user>.github.io`는 **origin이 다르다**.  
로컬에서 하던 세이브는 **자동으로 웹 배포판에 이어지지 않는다**. 이전하려면 **JSON 백업 파일**으로 옮기거나, 배포 후 새로 플레이해야 한다.

---

## 4. GitHub Pages에서의 “세이브 연동” 범위 (현재 상태)

| 기능 | Pages에서 가능 여부 |
|------|---------------------|
| 동일 URL 재방문 시 이어하기 | 가능 (`localStorage` 유지) |
| 다른 기기·브라우저와 실시간 동기화 | **불가** (서버 없음) |
| 슬롯 백업(로컬 미러) | 가능 |
| JSON 파일로 이동·보관 | 가능 (권장 이전 수단) |
| 향후 서버 세이브 API (`Docs/specs/api_spec_1.md`) | 별도 API 호스트 + CORS 설정 후 연동 |

---

## 5. 권장 운영 순서 (무과금 MVP)

1. GitHub Pages로 정적 배포만 진행.
2. 유저에게 **“같은 브라우저에서만 자동 저장”** + **“기기 옮길 땐 설정 → 백업 관리에서 JSON 저장”** 안내.
3. 수익·유저 증가 후 **Supabase 등 BaaS** 또는 자체 API로 `api_spec` 연동.

---

## 6. 제한·보안 메모

- `localStorage`는 **용량 제한**(수 MB 수준)과 **브라우저 삭제 시 소실**이 있다.
- 비밀번호 평문 저장 등은 **데모 수준**이므로, 서비스 확대 시 서버 인증·해시로 이전해야 한다.

---

## 7. 관련 코드·문서

- 저장 추상화: `js/storage.js`
- 백업 UI: `js/engine/ui-backup.js`
- 배포 일반: `Docs/plans/deploy_process_1.md`
- 서버 저장(향후): `Docs/specs/api_spec_1.md`, `openapi/save-v1.yaml`

---

## 변경 이력

- **1판**: GitHub Pages 정적 배포와 현재 세이브·백업 동작 범위 정리.
