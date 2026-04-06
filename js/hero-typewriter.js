/**
 * Адаптация логики TextType (React Bits) для статической страницы.
 * Без GSAP: мигание курсора — CSS @keyframes.
 */
(function () {
  var cfg = {
    texts: [
      'Я делаю сайты, интерфейсы и digital-проекты, которые выглядят как вайб, а работают как система',
      'Не шаблон — ощущение: стиль, логика и подача, которые запоминаются.',
      'От первого вайба до готовой страницы — быстро и со вкусом.',
    ],
    typingSpeed: 52,
    deletingSpeed: 95,
    pauseDuration: 3200,
    initialDelay: 400,
    loop: true,
    showCursor: true,
    cursorBlinkDuration: 0.5,
    hideCursorWhileTyping: false,
  };

  /* Как в примере React: typingSpeed: 195 — раскомментируй и замени typingSpeed выше
  cfg.typingSpeed = 195;
  cfg.deletingSpeed = 95;
  cfg.pauseDuration = 3200;
  */

  function init() {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var content = document.getElementById('hero-typewriter-text');
    var wrap = document.querySelector('.hero-typewriter');
    var cursor = document.querySelector('.hero-typewriter .text-type__cursor');
    if (!content || !wrap) return;

    if (!cfg.showCursor && cursor) {
      cursor.hidden = true;
    }

    if (reduced) {
      content.textContent = cfg.texts[0];
      if (cursor) cursor.hidden = true;
      return;
    }

    if (cursor && cfg.cursorBlinkDuration) {
      cursor.style.setProperty('--cursor-blink', cfg.cursorBlinkDuration + 's');
    }

    var texts = cfg.texts;
    var ti = 0;
    var charIndex = 0;
    var deleting = false;
    var displayed = '';
    var timeoutId = null;

    function clearCursorHidden() {
      if (cursor && cfg.hideCursorWhileTyping) {
        cursor.classList.remove('text-type__cursor--hidden');
      }
    }

    function setCursorHidden(hide) {
      if (cursor && cfg.hideCursorWhileTyping) {
        cursor.classList.toggle('text-type__cursor--hidden', hide);
      }
    }

    function tick() {
      var full = texts[ti];
      if (!full) return;

      if (deleting) {
        if (displayed.length === 0) {
          deleting = false;
          if (ti === texts.length - 1 && !cfg.loop) {
            clearCursorHidden();
            return;
          }
          ti = (ti + 1) % texts.length;
          charIndex = 0;
          timeoutId = setTimeout(tick, cfg.pauseDuration);
          return;
        }
        displayed = displayed.slice(0, -1);
        content.textContent = displayed;
        setCursorHidden(true);
        timeoutId = setTimeout(tick, cfg.deletingSpeed);
        return;
      }

      if (charIndex < full.length) {
        displayed += full.charAt(charIndex);
        charIndex += 1;
        content.textContent = displayed;
        setCursorHidden(cfg.hideCursorWhileTyping && charIndex < full.length);
        timeoutId = setTimeout(tick, cfg.typingSpeed);
        return;
      }

      clearCursorHidden();
      if (texts.length <= 1 && !cfg.loop) return;

      if (!cfg.loop && ti === texts.length - 1) return;

      timeoutId = setTimeout(function () {
        deleting = true;
        tick();
      }, cfg.pauseDuration);
    }

    timeoutId = setTimeout(tick, cfg.initialDelay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
