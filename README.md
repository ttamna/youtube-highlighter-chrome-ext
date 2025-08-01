# YouTube Score Highlighter Extension

## 소개
YouTube 추천/검색/사이드 영상의 '핫' 점수를 계산해 하이라이트해주는 크롬 확장입니다.

## 스크린샷
![](./docs/capture.JPG)

## 주요 기능
- 영상별 '핫' 점수 계산 및 배지 표시
- 추천/검색/사이드 영상 하이라이트
- 점수 기준(Threshold) 옵션 지원
- 본 영상 상세 점수 배지 표시

## 설치 방법
1. 저장소 클론
2. 의존성 설치 및 빌드
3. 크롬 확장 개발자 모드에서 dist 폴더 로드

크롬에서 `chrome://extensions` 페이지 이동 -> 개발자 모드 활성화 후 -> 압축해제된 확장프로그램 로드 -> `dist` 폴더 로드

## 사용법
- YouTube 접속 시 자동 동작
- 옵션 페이지에서 점수 기준 조정 가능

## 폴더 구조
- src/: 주요 TypeScript 소스
- public/: manifest, 아이콘, 옵션 페이지 등

## 기여 방법
- 이슈/PR 환영

## 라이선스
MIT

## 문의
(이메일 또는 깃허브 이슈)