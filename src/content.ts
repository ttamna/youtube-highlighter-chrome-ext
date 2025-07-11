// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const chrome: any;

import { parseViewCount } from './utils/parseViewCount';
import { parseUploadTime } from './utils/parseUploadTime';
import { calcHotScore } from './utils/calcHotScore';

let hotScoreThreshold = 5000;

function calculateScore({ viewCount, likeCount, commentCount, publishedAt, subscriberCount }: { viewCount: number, likeCount: number, commentCount: number, publishedAt: string, subscriberCount: number }) {
  const hoursSinceUpload = (Date.now() - new Date(publishedAt).getTime()) / 36e5;
  const viewsPerHour = viewCount / hoursSinceUpload;
  const likeRatio = likeCount / viewCount;
  const commentRatio = commentCount / viewCount;

  return (
    viewsPerHour * 1.5 +
    likeRatio * 500 +
    commentRatio * 200 +
    Math.log(subscriberCount || 1) * 10
  );
}


(async () => {
  const videoId = new URLSearchParams(window.location.search).get('v');
  if (!videoId) return;

  const apiKey = 'YOUR_YOUTUBE_API_KEY';

  const videoRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`
  );
  const videoData = (await videoRes.json()).items?.[0];
  if (!videoData) return;

  const channelId = videoData.snippet.channelId;
  const channelRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`
  );
  const channelData = (await channelRes.json()).items?.[0];

  const score = calculateScore({
    viewCount: +videoData.statistics.viewCount,
    likeCount: +videoData.statistics.likeCount,
    commentCount: +videoData.statistics.commentCount,
    publishedAt: videoData.snippet.publishedAt,
    subscriberCount: +channelData.statistics.subscriberCount,
  });

  // YouTube 제목 아래 삽입
  const titleElement = document.querySelector('#title h1');
  if (titleElement) {
    const badge = document.createElement('div');
    badge.innerText = `🔥 콘텐츠 점수: ${score.toFixed(1)}`;
    badge.className = 'yt-score-badge';
    titleElement.parentElement?.appendChild(badge);
  }
})();

// YouTube 홈 추천 영상 카드 정보 파싱 (1차: 콘솔 출력)

function getVideoCards(): HTMLElement[] {
  if (window.location.pathname === '/') {
    // 홈: ytd-rich-item-renderer
    return Array.from(document.querySelectorAll('ytd-rich-item-renderer'));
  } else if (window.location.pathname === '/results') {
    // 검색: ytd-video-renderer
    return Array.from(document.querySelectorAll('ytd-video-renderer'));
  }
  return [];
}

function extractVideoInfo(card: HTMLElement) {
  const titleEl = card.querySelector('#video-title');
  const title = titleEl?.textContent?.trim() || '';
  const viewEl = card.querySelector('#metadata-line span');
  const viewText = viewEl?.textContent?.trim() || '';
  const viewCount = parseViewCount(viewText);
  const timeEls = card.querySelectorAll('#metadata-line span');
  const uploadText = timeEls.length > 1 ? timeEls[1].textContent?.trim() || '' : '';
  const hoursSinceUpload = parseUploadTime(uploadText);
  const url = (titleEl as HTMLAnchorElement)?.href || '';
  const thumbEl = card.querySelector('img');
  const thumbnail = thumbEl?.src || '';
  const hotScore = calcHotScore(viewCount, hoursSinceUpload);
  return { title, viewText, viewCount, uploadText, hoursSinceUpload, url, thumbnail, hotScore };
}

function highlightHotVideos() {
  const cards = getVideoCards();
  cards.forEach(card => {
    const info = extractVideoInfo(card);
    if (info.hotScore >= hotScoreThreshold) {
      card.classList.add('yt-hot-highlight');
    } else {
      card.classList.remove('yt-hot-highlight');
    }
  });
}

function logAllVideoInfos() {
  const cards = getVideoCards();
  const infos = cards.map(extractVideoInfo);
  console.log('[YouTube Highlighter] 추천/검색 영상 정보:', infos);
}

function observeAndHighlight() {
  highlightHotVideos();
  logAllVideoInfos();
  const observer = new MutationObserver(() => {
    highlightHotVideos();
    logAllVideoInfos();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function initThresholdAndObserve() {
  chrome.storage.sync.get({ hotScoreThreshold: 5000 }, (items: { hotScoreThreshold: number }) => {
    hotScoreThreshold = items.hotScoreThreshold;
    observeAndHighlight();
  });
  chrome.storage.onChanged.addListener((changes: any, area: string) => {
    if (area === 'sync' && changes.hotScoreThreshold) {
      hotScoreThreshold = changes.hotScoreThreshold.newValue;
      highlightHotVideos();
    }
  });
}

if (window.location.pathname === '/' || window.location.pathname === '/results') {
  initThresholdAndObserve();
}
