# 📄 Product Requirements Document (PRD)

## 🧭 프로젝트명
**YouTube Highlighter Extension**  
– 유튜브 추천 영상 중 '핫한' 영상을 하이라이팅해주는 크롬 확장 프로그램

---

## 1. 📌 제품 개요

### 목적
YouTube의 추천 화면에서 사용자에게 노출되는 수많은 영상 중,  
**최근 업로드되고 빠르게 반응(조회수)이 증가하고 있는 '핫한 영상'을 식별하여 시각적으로 강조**함으로써  
사용자의 탐색 효율성과 경험을 향상시키는 것을 목표로 한다.

### 문제점
- 유튜브 홈화면에는 개인화된 추천 영상이 다수 노출되지만, **어떤 영상이 실제로 '뜨고 있는지' 즉시 판단하기 어렵다.**
- 제목 키워드는 과장된 경우가 많고, 조회수만으로는 **'속도감 있는 반응'을 판단하기 어렵다.**

---

## 2. 🎯 주요 기능

### [F1] 영상 정보 파싱
- 유튜브 추천 홈(`/`) 화면에서, 화면 내 모든 추천 영상 카드 DOM을 순회
- 각 카드에서 다음 정보를 파싱:
  - 영상 제목
  - 조회수 (예: "조회수 5.3만회" → `53000`)
  - 업로드 시간 (예: "2시간 전" → `2`)
  - 영상 URL
  - 영상 썸네일

### [F2] 핫 점수 계산
- 다음 공식을 기반으로 핫 점수를 계산:

\`\`\`ts
hotScore = viewCount / (hoursSinceUpload + 1)
\`\`\`

- 예: 3시간 전 업로드, 조회수 4만 → `40000 / 4 = 10,000`

### [F3] 하이라이트 표시
- 계산된 핫 점수가 사용자 설정 임계치 이상일 경우 해당 카드에 테두리 강조 효과 적용
  - 기본 테두리: `3px solid red`, `border-radius: 10px`
- 카드 하단에 점수 툴팁 표시(optional)

### [F4] 사용자 설정 (옵션 페이지)
- 사용자가 다음 값을 설정할 수 있는 `options.html` 제공
  - 핫 점수 기준 임계치 (`hotScoreThreshold`) → 기본값 `5000`
- `chrome.storage.sync`에 저장
- 설정 변경 시 실시간 반영

---

## 3. 📦 기술 스펙

### 확장 구성 요소

| 파일 | 설명 |
|------|------|
| `manifest.json` | permissions, content scripts, options page 등록 |
| `content_script.ts` | DOM 파싱, 점수 계산, 스타일 삽입 |
| `options.html/js` | 사용자 설정 UI, `storage.sync` 저장 처리 |
| (추가 가능) `utils.ts` | 조회수/시간 파싱 유틸, 점수 계산 함수 |

### 권한 설정

\`\`\`json
"permissions": [
  "storage"
],
"host_permissions": [
  "https://www.youtube.com/*"
],
\`\`\`

---

## 4. ✅ 동작 흐름

1. 사용자가 유튜브 홈(`https://www.youtube.com/`)에 접속
2. `content_script.ts`가 추천 카드들을 순회
3. 조회수 + 업로드 시간 파싱 → `hotScore` 계산
4. `hotScore >= threshold`인 경우 카드 테두리 강조
5. 사용자는 `옵션`에서 기준점수 조정 가능

---

## 5. 🧪 예외/경계 조건

- 업로드 시간이 "1일 전", "3주 전" 등인 경우 → 시간 단위로 정규화 필요
- 조회수가 없는 영상 또는 Shorts (조회수 표시 없음) → 하이라이팅 대상 제외
- YouTube UI 클래스명이 바뀔 경우 → 대응 필요

---

## 6. 📈 향후 확장 가능성 (v2~)

| 기능 | 설명 |
|------|------|
| 클립 생성 버튼 | 영상 카드에 "클립 만들기" 버튼 삽입 (너의 서비스와 연결) |
| 영상 길이 반영 | 1분짜리 영상 vs 1시간짜리 영상 점수 보정 |
| 좋아요 수 반영 | 좋아요/댓글 수도 핫 점수에 일부 반영 |
| 점수 시각화 | 영상 카드에 `🔥 8540점` 텍스트 표시 |
| 핫 영상만 추려서 별도 리스트로 뽑기 |

---

## 7. 🛠 개발 체크리스트 (1차 구현용)

| 항목 | 상태 |
|------|------|
| [ ] manifest.json 구성 및 content_script 등록 |
| [ ] 추천 영상 DOM 파싱 및 정보 추출 로직 구현 |
| [ ] 조회수/시간 파싱 유틸 구현 |
| [ ] 핫 점수 계산 및 기준점수 적용 |
| [ ] 하이라이트 스타일 삽입 |
| [ ] 옵션 페이지 UI 제작 |
| [ ] storage 연동 및 값 저장/읽기 구현 |
| [ ] 테스트 및 UI 동작 확인 |
| [ ] v1 배포 및 개선 피드백 수집 |

---

## ✅ 요약 한 줄

> **유튜브에서 "반응 빠른 뜨는 영상"만 강조해서 보여주는 크롬 확장 기능**  
> – 클릭 전에 미리 걸러주고, 클립화는 그 다음 단계로 연결

## v1 피드백 및 개선사항

- (예시) 임계값을 3000으로 낮추니 너무 많은 영상이 하이라이트됨. 기본값 조정 필요?
- (예시) 모바일 유튜브에서는 동작하지 않음. 향후 지원 검토
- (추가 피드백 작성란)