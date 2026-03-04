# Planner 001

아이패드·갤럭시 탭 최적화 PDF 플래너 웹사이트. AI 사주·별자리 운세가 포함된 맞춤 PDF 플래너를 제공합니다.

## 주요 기능

| 기능 | 설명 |
|------|------|
| **무료 플래너** | 5종 디자인 템플릿, 회원가입 없이 즉시 다운로드 |
| **프리미엄 플래너** | AI 사주·별자리·커플 운세 포함 맞춤 PDF 생성 |
| **운세·사주** | Claude AI 기반 사주 풀이, 별자리 운세, 오늘의 운세 |
| **PDF 하이퍼링크** | 연간→월별→주간→일별 PDF 내부 하이퍼링크 내비게이션 |
| **공휴일 자동 표시** | 한국 공휴일·대체공휴일 자동 표시 |
| **사용자 대시보드** | 구매 내역, 계정 관리 |
| **관리자 대시보드** | 사용자·매출·통계 관리 |

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| State | Zustand + persist |
| Data Fetching | TanStack Query |
| PDF 생성 | pdf-lib + @pdf-lib/fontkit (클라이언트 사이드) |
| AI | @anthropic-ai/sdk (Claude Haiku) |
| SEO | react-helmet-async + JSON-LD |
| Hosting | Cloudflare Pages |
| DB | Cloudflare D1 (SQLite) |
| Session | Cloudflare KV |

## 시작하기

```bash
npm install
npm run dev          # 로컬 개발 서버
```

## Cloudflare Pages 배포

```bash
# 1. D1 데이터베이스 생성 및 마이그레이션
wrangler d1 create planner-db
wrangler d1 execute planner-db --file=schema/001_init.sql
wrangler d1 execute planner-db --file=schema/002_seed.sql

# 2. KV 네임스페이스 생성
wrangler kv namespace create SESSIONS

# 3. wrangler.toml의 database_id, kv id 업데이트

# 4. 환경 변수 설정 (Cloudflare Dashboard)
# ANTHROPIC_API_KEY=sk-ant-...
# JWT_SECRET=your-secret-key

# 5. 배포
npm run pages:deploy
```

## 프로젝트 구조

```
src/
  components/     # UI 컴포넌트
    Layout/       # Navbar, Footer, SEOHead
    Home/         # Hero, Features, PlannerShowcase, HowItWorks
    Planners/     # PlannerCard, PlannerFilter
    PDF/          # PDFGenerator
    Fortune/      # SajuForm, AstrologyForm, FortuneDisplay
    Auth/         # LoginForm, RegisterForm
  pages/          # 페이지 컴포넌트
  lib/
    pdf/          # PDF 생성 엔진 (generator.ts, templates.ts)
    holidays.ts   # 한국 공휴일 계산
    api.ts        # API 클라이언트
    seo.ts        # SEO 유틸리티
  data/           # 정적 플래너 데이터
  store/          # Zustand 스토어
  types/          # TypeScript 타입 정의
functions/        # Cloudflare Pages Functions (API)
  api/
    auth/         # 로그인, 회원가입, 로그아웃
    planners/     # 플래너 목록 API
    fortune.ts    # 운세·사주 Claude API
    admin/        # 관리자 통계
schema/           # D1 SQL 스키마 및 시드 데이터
```
