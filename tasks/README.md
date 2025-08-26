# 📋 작업 지시서 보관소

*AI 작업 지시서를 체계적으로 관리하는 폴더입니다.*

---

## 📁 폴더 구조

```
tasks/
├── README.md                    # 이 파일
├── hotfix/                      # 긴급 버그 수정
│   └── YYYYMMDD-[이슈].md     # 날짜별 긴급 수정
├── features/                    # 기능 구현
│   └── [기능명].md             # 기능별 지시서
├── api/                         # API 작업
│   └── [엔드포인트].md         # API별 지시서
└── [프로젝트명]/               # 대규모 작업
    ├── README.md               # 프로젝트 개요
    └── PHASE_N_[이름].md       # Phase별 지시서
```

## 📝 작성 규칙

### 파일명 규칙
- **케밥-케이스** 사용 (예: `add-user-profile.md`)
- **명확한 목적** 표현 (예: `fix-auth-error.md`)
- **날짜 형식**: YYYYMMDD (예: `20250223-auth-bug.md`)

### 폴더 분류 기준
| 폴더 | 용도 | 예시 |
|------|------|------|
| `hotfix/` | 긴급 버그 수정 | `20250223-401-error.md` |
| `features/` | 새 기능 구현 | `youtube-lens.md` |
| `api/` | API 엔드포인트 작업 | `collections-crud.md` |
| `[프로젝트명]/` | 대규모/다단계 작업 | `enterprise-migration/` |

## 📊 작업 현황

### 진행 중인 작업
- [ ] (작업 없음)

### 완료된 작업
- [ ] (작업 없음)

### 대기 중인 작업
- [ ] (작업 없음)

## 🔗 관련 문서

- 지시서 작성 가이드: `/docs/INSTRUCTION_TEMPLATE.md`
- 프로젝트 현황: `/docs/PROJECT.md`
- 반복 실수 방지: `/docs/CONTEXT_BRIDGE.md`

## 💡 사용 방법

### 1. 새 지시서 작성
```bash
# 단일 작업
cp ../docs/INSTRUCTION_TEMPLATE.md ./new-feature.md

# 대규모 작업
mkdir project-name
cp ../docs/INSTRUCTION_TEMPLATE.md ./project-name/README.md
```

### 2. 지시서 저장
```bash
# Git 커밋
git add tasks/
git commit -m "docs: Add task instruction for [작업명]"
```

### 3. 작업 추적
- 이 README.md의 작업 현황 섹션 업데이트
- 관련 이슈/PR 링크 추가

---

*지시서 작성 시 `/docs/INSTRUCTION_TEMPLATE.md`를 참조하세요.*