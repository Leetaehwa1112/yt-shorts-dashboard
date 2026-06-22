// ==UserScript==
// @name         AlphaCut 유튜브 링크 자동입력
// @namespace    yt-shorts-dashboard
// @version      1.0
// @description  대시보드에서 ✂️알파컷을 누르면 넘어온 유튜브 링크를 알파컷 입력칸에 자동으로 채워준다 (붙여넣기 불필요)
// @match        https://alphacut.video/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(function () {
  'use strict';

  // true로 바꾸면 링크 채운 뒤 "쇼츠로 변환하기"까지 자동 클릭.
  // 기본 false: 사람이 템플릿/설정 확인 후 직접 변환 누르도록(권장).
  const AUTO_CONVERT = false;

  function urlFromHash() {
    const m = (location.hash || '').match(/[#&]yt=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : '';
  }

  function fillInput(url) {
    const input = [...document.querySelectorAll('input')].find(
      (el) => el.offsetParent !== null && /유튜브|youtube|링크/.test(el.placeholder || '')
    );
    if (!input) return false;
    // React 제어 input 안전 주입 (네이티브 setter + input 이벤트)
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, url);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.focus();
    return true;
  }

  function clickConvert() {
    const btn = [...document.querySelectorAll('button')]
      .find((b) => /쇼츠로 변환|변환하기/.test(b.innerText || ''));
    if (btn && !btn.disabled) { btn.click(); return true; }
    return false;
  }

  function run() {
    const url = urlFromHash();
    if (!url) return;
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      if (fillInput(url)) {
        clearInterval(timer);
        // 해시 제거 → 새로고침해도 중복 입력 안 됨
        history.replaceState(null, '', location.pathname + location.search);
        if (AUTO_CONVERT) setTimeout(clickConvert, 700);
      } else if (tries > 40) {
        clearInterval(timer); // ~8초 후 포기 (페이지 구조 바뀜)
      }
    }, 200);
  }

  window.addEventListener('hashchange', run);
  run();
})();
