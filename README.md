# Clean Check

## 1. 프로젝트 소개

Clean Check는 선수가 약 봉투, 약 상자, 처방전, 성분표 이미지를 업로드한 뒤 약 이름, 성분명, 용량을 직접 확인하고 최근 복용 이력을 정리하는 모바일 우선 웹앱입니다.

이 앱은 도핑검사 상황에서 필요한 기록을 빠르게 모으는 프로토타입이며, 최종 확인은 KADA 공식 검색, 의료진, 약사 등 전문가를 통해 진행해야 합니다.

## 2. MVP 범위

- 선수 정보 입력
- 이미지 업로드 및 미리보기
- 브라우저 OCR 및 데모 파일명 fallback
- WADA/KADA 공식 자료 기반 MVP 성분 seed DB
- 국내 의약품명 alias seed DB 및 500개 이상 기본 성분·함량 검색 seed
- MFDS/식약처 provider 확장 구조와 API 키 미설정 시 seed fallback
- 추출 정보 확인 및 수정
- 4단계 위험 상태 표시
- 복용 여부, 날짜, 시간, 용량, 메모 저장
- 최근 7일, 14일, 30일 리포트
- 공유 링크 복사
- 브라우저 인쇄 기반 PDF 저장
- localStorage 기반 데이터 유지

## 3. 제외 기능

- 서버형 OCR API
- KADA 검색서비스 전체 데이터 복제
- 건강보험심사평가원/약학정보원 전체 의약품 DB 연동
- 서버 저장소
- 로그인과 권한 분리
- 자동 민감정보 마스킹
- KADA 시스템 직접 제출
- 약 교체 안내
- 의료적 판단 자동화

## 4. 설치 방법

```bash
npm install
```

## 5. 실행 방법

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

Windows에서는 `start-clean-check.bat`를 실행하면 개발 서버를 시작하고 브라우저를 열 수 있습니다. 종료는 `stop-clean-check.bat`를 실행합니다.

## 6. 테스트 방법

```bash
npm run lint
npm run typecheck
npm run test
npm run e2e
npm run build
npm run validate
```

## 7. 배포 방법

Vercel에서 이 저장소를 연결한 뒤 기본 Next.js 설정으로 배포할 수 있습니다.

선택 환경 변수 예시는 `.env.example`에 있습니다. OCR과 외부 의약품 조회 키가 없으면 앱은 로컬 seed와 수동 입력 흐름으로 동작합니다.

## 8. 제품 안전 원칙

- 결과는 기록과 확인 보조 목적입니다.
- 앱은 사용자가 직접 입력한 약물·성분 정보를 바탕으로 확인이 필요한 항목을 정리합니다.
- 특정 약물의 최종 판단은 KADA 공식 검색, 의료진, 약사 등 전문가 확인이 필요합니다.
- `confirmed_candidate`도 단정 결과가 아니며 경기기간, 투여경로, 용량에 따라 달라질 수 있습니다.
- 색상만으로 상태를 이해하게 하지 않고 상태명과 설명을 함께 제공합니다.

## 9. 성분 DB 구축 방식

- `lib/substanceDatabase.ts`에 MVP seed DB를 둡니다.
- 기준 출처는 WADA 2026 Prohibited List, WADA 2026 Monitoring Program, KADA 금지목록 소개, KADA 금지약물 검색서비스입니다.
- DB 항목은 성분명, 한글명, alias, WADA/KADA 분류, 적용 범위, 앱 표시 위험 상태, 출처명, DB 버전을 포함합니다.
- `lib/medicationDatabase.ts`와 `lib/medicationSeedBulk.ts`에 국내 제품명 alias seed와 500개 이상 기본 성분·함량·제형 검색 seed를 둡니다.
- 기본 성분 seed는 OCR이 제품명만 찾거나 성분명이 일부만 인식된 경우 후보를 빠르게 제시하기 위한 보조 데이터입니다.
- 전체 허가 의약품 원본 복제본이 아니므로 실제 제품명, 제조사, 허가사항, 최신 변경 여부는 의약품안전나라, 약학정보원, KADA 검색서비스 등에서 다시 확인해야 합니다.
- 앱은 DB 매칭 결과를 “DB 매칭 근거”로 표시하며, 최종 확인은 KADA 공식 검색과 전문가 상담 흐름으로 안내합니다.
- 운영 전환 시에는 공식 업데이트 주기와 동기화하고, 원자료 라이선스/이용 조건을 확인한 뒤 서버 저장소로 관리해야 합니다.

## 10. 금지 표현

UI, 코드 상수, 테스트 데이터, 문서에서 다음 범주의 문구를 쓰지 않습니다.

- 무조건 괜찮다고 단정하는 문구
- 복용을 승인하는 문구
- 도핑과 무관하다고 단정하는 문구
- 최종 기관 판단처럼 보이는 문구
- 증명이나 제출이 끝났다고 오해시키는 문구
- 다른 약을 권하는 문구

## 11. 추후 개발 로드맵

- OCR 정확도 개선
- Supabase 저장소 연동
- KADA 검색서비스 확인 링크 고도화
- 국내 의약품 DB 정식 연동
- 로그인/권한 분리
- 지도자/팀 공유 화면
- 리마인드 기능
- 민감정보 자동 마스킹
- 공식 자료 링크 고도화
- 전문가 검수 플로우

## 12. Supabase 및 의약품 캐시 DB

프로덕션 전환용 DB 스키마는 `supabase/migrations`에 있습니다. SQL editor에서 직접 실행하거나, 원격 Postgres 연결 URL을 `SUPABASE_DB_URL`에 넣은 뒤 로컬에서 적용합니다.

필수 공개 설정:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
# 구형 프로젝트는 NEXT_PUBLIC_SUPABASE_ANON_KEY를 대신 사용할 수 있습니다.
```

배치 적재 전용 서버 설정:

```bash
SUPABASE_SERVICE_ROLE_KEY=
# 또는 sb_secret_ 키를 별도 변수로 둘 수 있습니다.
SUPABASE_SECRET_KEY=
SUPABASE_DB_URL=
DRB_EASY_DRUG_API_KEY=
```

`SUPABASE_DB_URL`은 Supabase Dashboard의 Database connection string입니다. API secret/service role key로는 row upsert와 RLS 우회는 가능하지만 테이블 생성 SQL을 실행할 수 없으므로, 최초 스키마 적용에는 DB URL 또는 SQL editor가 필요합니다.

스키마 적용과 현재 로컬 의약품 seed DB 이관을 한 번에 실행합니다.

```bash
npm run supabase:setup
```

단계별로 실행하려면 다음 명령을 사용합니다.

```bash
npm run supabase:migrate
npm run seed:local-medications
npm run seed:prohibited-substances
npm run match:medication-substances
npm run supabase:check
npm run supabase:check:write
```

쓰기 테스트가 스키마 캐시 또는 권한 오류를 내면 `supabase/migrations/202606120002_api_grants.sql`도 적용합니다.

자주 검색하는 약품명은 `scripts/medication-seed-queries.txt`에 한 줄씩 넣습니다. 예시는 `scripts/medication-seed-queries.example.txt`를 참고하세요.

```bash
npm run seed:easy-drugs -- --file scripts/medication-seed-queries.txt --dry-run
npm run seed:easy-drugs -- --file scripts/medication-seed-queries.txt
```

검색 API는 Supabase `medication_products` 캐시 DB를 먼저 조회하고, 로컬 seed DB를 fallback으로 사용합니다. 공공데이터 실시간 조회는 트래픽 보호를 위해 기본 비활성화되어 있으며, 임시 검증이 필요할 때만 `ENABLE_REALTIME_MEDICATION_LOOKUP=true`로 켭니다.

금지성분 원장은 `prohibited_substances` 테이블에 저장되고, 현재 의약품 캐시의 성분별 매칭 결과는 `medication_substance_matches` 테이블에 저장됩니다. `match:medication-substances`는 각 `medication_products.raw.clean_check_substance_match`에도 최고 위험도, 매칭 수, 미매칭 성분 요약을 남깁니다. WADA PDF 추출과 seed 검증은 다음 명령으로 확인합니다.

```bash
npm run wada:extract
```

앱 사용자 기록은 `app_records` 테이블에 저장됩니다. 선수 등록 DB, 선수 프로필, 업로드 메타데이터, 추출 약품/성분, 위험 체크, 복용 기록은 Supabase로 upsert되며, 기존 브라우저 localStorage 기록은 로그인/대시보드/리포트 진입 시 Supabase로 이관됩니다. OCR 진행 중 draft, 현재 결과 포인터, 검색 캐시, 이미지 data URL은 빠른 화면 전환과 민감 이미지 최소 저장을 위해 브라우저 로컬에 유지합니다.

관리자 의약품 보강 DB는 `medication_products`의 `admin_custom` source로 저장됩니다. 기존 브라우저 로컬 관리자 데이터가 있으면 관리자 화면 진입 시 Supabase로 upsert됩니다.

관리자 페이지는 `access_logs`를 통해 선수 로그인 성공/실패, 관리자 로그인 성공/실패, 관리자 overview 조회 이벤트를 기록합니다. 관리자 화면에서는 전체 사용자 현황, 사용자별 업로드/약품/복용/위험 기록 수, 최근 접속·활동 시간, 최근 접속 기록, CSV 내보내기를 확인할 수 있습니다.
