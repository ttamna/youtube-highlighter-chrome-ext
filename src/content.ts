// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const chrome: any;

import { parseViewCount } from './utils/parseViewCount';
import { parseUploadTime } from './utils/parseUploadTime';
import { calcHotScore } from './utils/calcHotScore';

let hotScoreThreshold = 5000;

// 1. 전역 observer 변수 선언
let observer: MutationObserver | null = null;


function calculateDetailedScore({ viewCount, likeCount, subscriberCount, hoursSinceUpload }: { viewCount: number, likeCount: number, subscriberCount: number, hoursSinceUpload: number }) {
  // 예시: 조회수/시간 + 좋아요/10 + log(구독자수)*10
  return (
    (viewCount / (hoursSinceUpload + 1)) +
    (likeCount / 10) +
    (Math.log(subscriberCount || 1) * 10)
  );
}

// YouTube 홈 추천 영상 카드 정보 파싱 (1차: 콘솔 출력)

function getVideoCards(): HTMLElement[] {
  if (window.location.pathname === '/') {
    // 홈: ytd-rich-item-renderer
    return Array.from(document.querySelectorAll('ytd-rich-item-renderer')) as HTMLElement[];
  } else if (window.location.pathname === '/results') {
    // 검색: ytd-video-renderer
    return Array.from(document.querySelectorAll('ytd-video-renderer')) as HTMLElement[];
  } else if (window.location.pathname === '/watch') {
    // 영상 재생: 오른쪽 추천영상 ytd-compact-video-renderer, yt-lockup-view-model
    return [
      ...Array.from(document.querySelectorAll('ytd-compact-video-renderer')) as HTMLElement[],
      ...Array.from(document.querySelectorAll('yt-lockup-view-model')) as HTMLElement[]
    ];
  }
  return [];
}

function extractVideoInfo(card: HTMLElement) {
  try {
    const titleEl = card.querySelector('#video-title') || card.querySelector('.yt-lockup-metadata-view-model-wiz__title');
    const title = titleEl?.textContent?.trim() || '';
    let viewText = '';
    let uploadText = '';
    if (card.matches('yt-lockup-view-model')) {
      const rows = card.querySelectorAll('.yt-content-metadata-view-model-wiz__metadata-row');
      if (rows.length > 1) {
        const metaSpans = rows[1].querySelectorAll('span');
        viewText = metaSpans[0]?.textContent?.trim() || '';
        uploadText = metaSpans[2]?.textContent?.trim() || '';
      }
    } else {
      const viewEl = card.querySelector('#metadata-line span');
      viewText = viewEl?.textContent?.trim() || '';
      const timeEls = card.querySelectorAll('#metadata-line span');
      uploadText = timeEls.length > 1 ? timeEls[1].textContent?.trim() || '' : '';
    }
    let viewCount = parseViewCount(viewText);
    let hoursSinceUpload = parseUploadTime(uploadText);
    if (isNaN(viewCount)) viewCount = 0;
    if (isNaN(hoursSinceUpload)) hoursSinceUpload = 0;
    const url = (titleEl as HTMLAnchorElement)?.href || '';
    const thumbEl = card.querySelector('img');
    const thumbnail = thumbEl?.src || '';
    let hotScore = calcHotScore(viewCount, hoursSinceUpload);
    if (isNaN(hotScore)) hotScore = 0;
    return { title, viewText, viewCount, uploadText, hoursSinceUpload, url, thumbnail, hotScore };
  } catch (e) {
    return { error: true, message: (e as Error).message, card };
  }
}

function highlightHotVideos() {
  const cards = getVideoCards();
  cards.forEach(card => {
    const info = extractVideoInfo(card);
    if (typeof info.hotScore === 'number' && info.hotScore >= hotScoreThreshold) {
      card.classList.add('yt-hot-highlight');
    } else {
      card.classList.remove('yt-hot-highlight');
    }
  });
}

function logAllVideoInfos() {
  const cards = getVideoCards();
  const infos = cards.map(extractVideoInfo);
  const errorInfos = infos.filter(info => (info as any).error);
  const validInfos = infos.filter(info => !(info as any).error);
  if (errorInfos.length > 0) {
    console.warn('[YouTube Highlighter] 파싱 에러:', errorInfos);
  }
  console.log('[YouTube Highlighter] 추천/검색/사이드 영상 정보:', validInfos);
}

function observeAndHighlight() {
  // 기존 옵저버 해제
  if (observer) observer.disconnect();
  highlightHotVideos();
  logAllVideoInfos();
  observer = new MutationObserver(() => {
    highlightHotVideos();
    logAllVideoInfos();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function cleanupObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

function initThresholdAndObserve() {
  chrome.storage.sync.get({ hotScoreThreshold: 5000 }, (items: { hotScoreThreshold: number }) => {
    hotScoreThreshold = items.hotScoreThreshold;
    // 홈/검색/재생에서 옵저버 활성화
    if (
      window.location.pathname === '/' ||
      window.location.pathname === '/results' ||
      window.location.pathname === '/watch'
    ) {
      observeAndHighlight();
    } else {
      cleanupObserver();
    }
  });
  chrome.storage.onChanged.addListener((changes: any, area: string) => {
    if (area === 'sync' && changes.hotScoreThreshold) {
      hotScoreThreshold = changes.hotScoreThreshold.newValue;
      highlightHotVideos();
    }
  });
}

function parseWatchPageAndShowDetailedScore() {
  // 1. 조회수
  const viewText = document.querySelector('.view-count, .yt-view-count-renderer')?.textContent || '';
  const viewCount = parseViewCount(viewText);
  // 2. 업로드 시간
  const uploadText = document.querySelector('#info-strings yt-formatted-string, .date')?.textContent || '';
  const hoursSinceUpload = parseUploadTime(uploadText);
  // 3. 좋아요 수
  let likeText = '';
  const likeBtn = document.querySelector('ytd-toggle-button-renderer[is-icon-button][aria-label*="좋아요"]') || document.querySelector('ytd-toggle-button-renderer[is-icon-button]');
  if (likeBtn) {
    likeText = likeBtn.textContent || '';
  } else {
    likeText = document.querySelector('yt-formatted-string[aria-label*="좋아요"]')?.textContent || '';
  }
  const likeCount = parseViewCount(likeText);
  // 4. 구독자 수
  const subText = document.querySelector('#owner-sub-count, .yt-subscriber-count-renderer')?.textContent || '';
  const subscriberCount = parseViewCount(subText);
  // 5. 점수 계산
  const detailedScore = calculateDetailedScore({ viewCount, likeCount, subscriberCount, hoursSinceUpload });
  // 6. 영상 제목 아래에 표시 (배지 갱신)
  const badgeId = 'yt-detailed-score-badge';
  const titleElement = document.querySelector('#title h1, .title.ytd-video-primary-info-renderer');
  if (titleElement) {
    let badge = document.getElementById(badgeId);
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'yt-score-badge';
      badge.id = badgeId;
      titleElement.parentElement?.appendChild(badge);
    }
    badge.innerText = `🔥 상세 점수: ${Math.round(detailedScore)}`;
  }
}

// [본 영상 점수 배지] 별도 setInterval로 #title h1 등 메인 영상 정보만 주기적으로 갱신
function startMainVideoScoreInterval() {
  let lastMainVideoId = '';
  setInterval(() => {
    // 본 영상 videoId 추출 (URL 파라미터 v)
    const videoId = new URLSearchParams(window.location.search).get('v') || '';
    if (window.location.pathname === '/watch') {
      if (videoId !== lastMainVideoId) {
        lastMainVideoId = videoId;
        // 새 영상 진입 시 즉시 갱신
        parseWatchPageAndShowDetailedScore();
      }
      // 항상 주기적으로 갱신 (DOM 변화 대응)
      parseWatchPageAndShowDetailedScore();
    }
  }, 1000);
}

if (
  window.location.pathname === '/' ||
  window.location.pathname === '/results' ||
  window.location.pathname === '/watch'
) {
  initThresholdAndObserve();
  if (window.location.pathname === '/watch') {
    // 상세 점수 배지 별도 setInterval로 관리 (추천영상 하이라이트와 분리)
    startMainVideoScoreInterval();
  }
}
