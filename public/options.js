// Placeholder for options page logic
// Will implement chrome.storage.sync logic in a later task 

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('hotScoreThreshold');
  const form = document.getElementById('options-form');
  const status = document.getElementById('status');

  // Load saved value
  chrome.storage.sync.get({ hotScoreThreshold: 5000 }, (items) => {
    input.value = String(items.hotScoreThreshold);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = parseInt(input.value, 10) || 5000;
    chrome.storage.sync.set({ hotScoreThreshold: value }, () => {
      status.textContent = '저장되었습니다!';
      setTimeout(() => (status.textContent = ''), 1500);
    });
  });
}); 