// src/preview/renderers/aviator.ts
import * as cheerio from 'cheerio';

import { PreviewDto } from '../dto/preview.dto';
import { appendInitScript, applyBonuses, setAttr, setText } from '../utils/utils';

export function renderAviator($: cheerio.CheerioAPI, payload: PreviewDto) {
  const $$ = cheerio.load($.html());
  $ = $$;

  // --- META / TITLE ---
  $('html').attr('lang', payload.locale || 'en');
  setText($, 'title', payload.title || '');
  setAttr($, 'meta[name="Description"]', 'content', payload.description || '');
  setAttr(
    $,
    'meta[name="apple-mobile-web-app-title"]',
    'content',
    payload.pwaName || payload.title || ''
  );

  // --- CTA / spins ---
  setText($, '#go-btn-default-text', payload.buttonDefault ?? '');
  setText($, '#go-btn-next-text', payload.buttonNext ?? '');
  setText($, '#go-btn-win-text', payload.buttonWin ?? '');
  setAttr($, '#go-btn', 'data-spins', String(payload.spins ?? 1));

  const s = payload.sectors || {};

  // Детект скина:
  //  - red: лейблы в .aviator-game-traff__bottom-section > span:first-child, валютный символ — ПЕРЕД #rate/#balance
  //  - two: лейблы в .aviator-game__rate-title / .aviator-game__balance-title, валютный символ — ПОСЛЕ #rate/#balance
  const isTwo = $('.aviator-game__rate-title, .aviator-game__balance-title').length > 0;

  // --- ЛЕЙБЛЫ Rate/Balance ---
  if (isTwo) {
    if (s.rateText) setText($, '.aviator-game__rate-title', s.rateText);
    if (s.balanceText) setText($, '.aviator-game__balance-title', s.balanceText);
  } else {
    if (s.rateText) {
      setText(
        $,
        '.aviator-game-traff__bottom .aviator-game-traff__bottom-section:first-child > span:first-child',
        s.rateText
      );
    }
    if (s.balanceText) {
      setText(
        $,
        '.aviator-game-traff__bottom .aviator-game-traff__bottom-section:last-child > span:first-child',
        s.balanceText
      );
    }
  }

  // --- ЗНАЧЕНИЯ rate / balance + data-* ---
  if (s.rate != null) {
    setAttr($, '#rate', 'data-rate', String(s.rate));
    setText($, '#rate', String(s.rate));
  }
  if (s.balanceMin != null) {
    setAttr($, '#balance', 'data-balancemin', String(s.balanceMin));
    setText($, '#balance', String(s.balanceMin));
  }
  if (s.balanceMax != null) {
    setAttr($, '#balance', 'data-balancemax', String(s.balanceMax));
  }

  // --- ВАЛЮТНЫЙ СИМВОЛ ---
  if (s.currencySymbol) {
    if (isTwo) {
      // Aviator Two: символ — СЛЕДУЮЩИЙ <span> ПОСЛЕ #rate/#balance
      const $rateCur = $('#rate').next('span');
      const $balCur = $('#balance').next('span');
      if ($rateCur.length) $rateCur.text(String(s.currencySymbol));
      if ($balCur.length) $balCur.text(String(s.currencySymbol));
    } else {
      // Aviator Red: символ — ПРЕДЫДУЩИЙ <span> ПЕРЕД #rate/#balance
      const $rateCur = $('#rate').prev('span');
      const $balCur = $('#balance').prev('span');
      if ($rateCur.length) $rateCur.text(String(s.currencySymbol));
      if ($balCur.length) $balCur.text(String(s.currencySymbol));
    }
  }

  // --- МОДАЛКИ ---
  // Основная модалка (в Two: #modal .modal__title span / .modal__text span; в Red: те же селекторы через другие классы)
  setText(
    $,
    '#modal .modal__title span, #modal .aviator-game-traff__modal-text .first',
    payload.effects?.modal?.title ?? ''
  );
  setText(
    $,
    '#modal .modal__text span,  #modal .aviator-game-traff__modal-text .first-1',
    payload.effects?.modal?.text ?? ''
  );
  // Кнопки подтверждения лежат вне модалки в обеих версиях — просто обновим их:
  setText($, '#win-button-modal span', payload.effects?.modal?.button ?? '');

  // Бонусная модалка (если задана)
  if (s.bonuses?.modal) {
    setText(
      $,
      '#bonusModal .modal__title span, #bonusModal .aviator-game-traff__modal-text .first',
      s.bonuses.modal.title ?? ''
    );
    setText(
      $,
      '#bonusModal .modal__text  span, #bonusModal .aviator-game-traff__modal-text .first-1',
      s.bonuses.modal.text ?? ''
    );
    setText($, '#win-bonus-button-modal span', s.bonuses.modal.button ?? '');
  }

  // --- БОНУСЫ: общий хелпер (inline, onPageLeave, gif, тексты) ---
  applyBonuses($, s.bonuses);

  // --- Безопасный init ---
  appendInitScript(
    $,
    `
      var rateEl = document.getElementById('rate');
      var balEl  = document.getElementById('balance');
      var cfg = {
        rate: rateEl?.dataset?.rate || rateEl?.textContent || '',
        balanceMin: balEl?.dataset?.balancemin || balEl?.textContent || '',
        balanceMax: balEl?.dataset?.balancemax || '',
        currencySymbol: (function(){
          // both skins: берём соседний span — в Red это prevSibling, в Two — nextSibling; возьмём любой непустой
          var prev = rateEl?.previousElementSibling?.textContent?.trim() || '';
          var next = rateEl?.nextElementSibling?.textContent?.trim() || '';
          return prev || next || '';
        })()
      };
      if (typeof window.initAviator === 'function') {
        window.initAviator(cfg);
      }
    `
  );

  return $;
}
