// src/renderers/render-3HotChiliesSlot.ts
import * as cheerio from 'cheerio';

import { PreviewDto } from '../dto/preview.dto';
import { appendInitScript, applyBonuses, setAttr, setText } from '../utils/utils';

/**
 * Рендерит тему "3HotChiliesSlot".
 *
 * Ожидаемые поля payload:
 * - title / description / pwaName / locale
 * - buttonDefault / buttonNext / buttonWin
 * - spins
 * - effects?.modal: { title, text, button }        // основная (win) модалка
 * - sectors?.bonuses: {
 *     gif, inlineBoxText, activeOnPageLeaveText,
 *     activeOnPageLeave, activeOnPageLoaded,
 *     modal: { title, text, button }                // бонусная модалка
 *   }
 */
export function renderSlots($: cheerio.CheerioAPI, payload: PreviewDto) {
  // Делаем локальную копию DOM, чтобы править безопасно
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

  // --- Кнопка GO (тексты и количество спинов) ---
  const spins = Number(payload.spins ?? 1) || 1;
  setText($, '#go-btn-default-text', payload.buttonDefault ?? '');
  setText($, '#go-btn-next-text', payload.buttonNext ?? '');
  setAttr($, '#go-btn', 'data-spins', String(spins));

  // Дублируем спины в #slot (как у linki)
  setAttr($, '#slot', 'data-spin', String(spins));

  // --- Основная модалка выигрыша (#modal) ---
  const modalActive = payload.effects?.modal?.active ?? true; // по умолчанию активна
  if (modalActive) {
    setText($, '#modal .modal__title span', payload.effects?.modal?.title ?? '');
    setText($, '#modal .modal__text  span', payload.effects?.modal?.text ?? '');
    // Текст кнопки: effects.modal.button приоритетнее, затем общий buttonWin
    const winBtn = payload.effects?.modal?.button ?? payload.buttonWin ?? '';
    setText($, '#modal #win-button-modal span', winBtn);
  } else {
    // Если выключена — убираем модалку из DOM
    $('#modal').remove();
  }

  // --- Бонусная модалка (#bonusModal) + inline/leave бонусы ---
  const s = payload.sectors || {};
  const bonuses = s.bonuses || {};

  // Тексты в bonusModal (если есть)
  if ($('#bonusModal').length) {
    setText($, '#bonusModal .modal__title span', bonuses.modal?.title ?? '');
    setText($, '#bonusModal .modal__text  span', bonuses.modal?.text ?? '');
    setText($, '#bonusModal #win-bonus-button-modal span', bonuses.modal?.button ?? '');
  }

  // Применяем общий бонус-пайплайн (inline, leave, gif, тексты и флаги)
  applyBonuses($, bonuses);

  // --- Инициализация темы (как у linki) ---
  appendInitScript(
    $,
    `
    (function () {
      try {
        var cfg = {
          spins: Number(document.querySelector('#go-btn')?.getAttribute('data-spins') || '${spins}') || ${spins},
          bonuses: {
            activeOnPageLoaded: ${JSON.stringify(!!bonuses.activeOnPageLoaded)},
            activeOnPageLeave: ${JSON.stringify(!!bonuses.activeOnPageLeave)}
          },
          template: '3HotChiliesSlot'
        };
        if (typeof window.init3HotChiliesSlot === 'function') {
          window.init3HotChiliesSlot(cfg);
        }
      } catch (e) {}
    })();
    `
  );

  return $;
}
