# 배포 프로세스·실무 준비 1

실제로 **URL·도메인·HTTPS**까지 포함해 서비스를 배포할 때 필요한 흐름과 준비사항을 정리한다.  
프로젝트 산출물과의 연결: `openapi/save-v1.yaml`, `openapi/examples/save-v1/`, `Docs/plans/deploy_plan_1.md`, `Docs/plans/logging_plan_1.md`.

---

## 1. URL 구조를 어떻게 잡을지

### 권장 패턴

| 용도 | 예시 | 비고 |
|------|------|------|
| 프로덕션 웹(정적) | `https://game.example.com` | SPA 또는 정적 HTML |
| API | `https://api.example.com` 또는 `https://game.example.com/api` | 동일 도메인이면 CORS 단순 |
| 스테이징 웹 | `https://staging.game.example.com` | 프로덕션과 분리 필수 |
| 스테이징 API | `https://api-staging.example.com` | DB·시크릿 분리 |

### 클라이언트 설정

- 환경 변수(빌드 시 주입): `VITE_API_BASE_URL`, `VITE_ENV=production|staging`
- 절대 URL은 코드에 하드코딩하지 않고 설정 파일/CI 시크릿으로 관리

---

## 2. 도메인·DNS

1. **도메인 등록** (가비아, Cloudflare Registrar, Route53 등)
2. **DNS 레코드**
   - 웹: `A` 또는 `CNAME` → 호스팅(Cloudflare Pages, Netlify, S3+CloudFront, Vercel 등)
   - API: `A`/`CNAME` → 로드밸런서 또는 컨테이너 호스트
3. **서브도메인 분리**
   - `www` vs apex(`@`) 리다이렉트 정책 결정
   - API 전용 서브도메인 권장 (`api.*`)

---

## 3. HTTPS (TLS 인증서)

- **Let's Encrypt** + 자동 갱신( Certbot, ACME, 호스팅 내장 )
- 또는 **Cloudflare** 프록시 뒤에 두고 엣지에서 TLS 종료
- 만료 알람 설정 (90일 전 갱신 실패 방지)

프로덕션에서는 **HTTP → HTTPS 리다이렉트** 필수.

---

## 4. 배포 대상별 준비

## 4.1 프론트엔드(정적 사이트)

- 빌드 산출물(`index.html`, `js/`, `style.css`, 자산) 업로드
- 캐시 정책: HTML은 짧게, 해시된 JS/CSS는 길게
- `Cache-Control`, 버전 쿼리(`?v=`) 또는 파일명 해시

## 4.2 백엔드(API)

- 런타임(Node, Go, 등) + 프로세스 관리(systemd, Docker, K8s)
- **헬스체크** 엔드포인트 (`GET /health`)
- **리버스 프록시** (Nginx, Caddy, ALB): TLS, gzip, 업스트림 라우팅
- DB 연결 풀, 마이그레이션 실행 순서(배포 전/후)

## 4.3 데이터베이스

- 프로덕션 전용 인스턴스 (스테이징과 물리/논리 분리)
- 자동 백업 + 복구 테스트 주기적 수행
- 접속은 VPC/방화벽으로 API 서버만 허용

---

## 5. 시크릿·환경 변수

다음은 **저장소에 커밋하지 않음**.

- DB URL, 비밀번호
- JWT 서명 키, 세션 시크릿
- OAuth 클라이언트 시크릿
- 외부 결제/푸시 API 키

저장 위치 예: GitHub Actions Secrets, AWS Secrets Manager, Doppler, 1Password 등.

---

## 6. CORS·보안 헤더

- API가 별도 도메인이면 `Access-Control-Allow-Origin`을 프로덕션 도메인으로 제한
- `Content-Security-Policy`, `X-Frame-Options`, `HSTS` 검토

---

## 7. 배포 파이프라인 (일반적 흐름)

1. **개발**: feature 브랜치 → PR
2. **CI**: 린트/테스트/빌드 (`validate-game-data` 등 포함 가능)
3. **스테이징 배포**: `develop` 또는 태그 기반
4. **스모크 테스트**: 로그인, 저장/로드, 핵심 플로우
5. **프로덕션 배포**: `main` 태그 또는 승인 게이트
6. **롤백**: 이전 이미지/이전 정적 버전으로 되돌리기 절차 문서화

---

## 8. 릴리즈 체크리스트 (배포 직전)

- [ ] 스테이징에서 동일 커밋 검증 완료
- [ ] DB 마이그레이션 스크립트 순서·롤백 계획 확인
- [ ] 환경 변수·시크릿 최신화
- [ ] 모니터링/알람 활성 (에러율, 5xx)
- [ ] 공지 채널(디스코드/슬랙) 준비

---

## 9. OpenAPI·Mock 활용

- 명세: `openapi/save-v1.yaml`
- 예시 JSON: `openapi/examples/save-v1/`
- Mock 서버 예:
  - [Prism](https://stoplight.io/open-source/prism) — `prism mock openapi/save-v1.yaml`
  - Postman/Insomnia에서 예시 파일 임포트

실제 URL은 환경마다 다르므로, 클라이언트는 **베이스 URL만 교체**하면 동일 경로(`/api/v1/save` 등)로 호출한다.

---

## 10. 관련 문서

- `Docs/plans/deploy_plan_1.md` — 배포 준비 계획(큰 그림)
- `Docs/plans/github_pages_deploy_1.md` — **무료 정적 호스팅(GitHub Pages)** 과 현재 `localStorage` 세이브·백업 범위
- `Docs/plans/logging_plan_1.md` — 로그·알람
- `Docs/specs/data_model_15.md` — 서버 저장 스키마
- `Docs/specs/api_spec_1.md` — Save API 계약

---

## 변경 이력

- **1판**: URL/DNS/TLS·배포 파이프라인·OpenAPI 예시 연동 정리.
- **2판**: GitHub Pages 무료 배포 설계 문서 링크 추가.
