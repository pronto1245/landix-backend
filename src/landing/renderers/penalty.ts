// src/preview/renderers/penalty.ts
import * as cheerio from 'cheerio';

import { PreviewDto } from '../dto/preview.dto';
import { appendInitScript, applyBonuses, setAttr, setText } from '../utils/utils';

export function renderPenalty($: cheerio.CheerioAPI, payload: PreviewDto) {
  // 1) meta / title
  const cleaned = $.html(); // у penalty нет жёсткого init — чистить нечего
  const $$ = cheerio.load(cleaned);
  $ = $$;

  $('html').attr('lang', payload.locale || 'en');
  setText($, 'title', payload.title || '');
  setAttr($, 'meta[name="Description"]', 'content', payload.description || '');
  setAttr($, 'meta[name="apple-mobile-web-app-title"]', 'content', payload.title || '');

  // 2) spins (если вдруг логика использует)
  setAttr($, '#go-btn', 'data-spins', String(payload.spins ?? 1));

  // 3) настройки из sectors
  const s = payload.sectors || {};

  // — Лейблы "Rate" / "Balance"
  if (s.rateText) {
    setText($, '.bottom-row .bottom-row__item:nth-of-type(1) h3', s.rateText);
  }
  if (s.balanceText) {
    setText($, '.bottom-row .bottom-row__item:nth-of-type(2) h3', s.balanceText);
  }

  // — Значения rate / balanceMin / balanceMax
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

  // — Символ валюты — это соседний <span> перед #rate/#balance
  const currency = s.currencySymbol || '';
  if (currency) {
    const $rateSpan = $('#rate').prev('span');
    const $balSpan = $('#balance').prev('span');
    if ($rateSpan.length) $rateSpan.text(currency);
    if ($balSpan.length) $balSpan.text(currency);
  }

  // 4) Мультипликаторы (верхняя линейка "точек")
  //   Вёрстка даёт 5 .point — подставим из sectors.multipliers (если есть),
  //   иначе попробуем из sectors.list (если там числа/коэфы).
  const multSrc: string[] = (
    Array.isArray(s.multipliers) && s.multipliers.length
      ? s.multipliers
      : Array.isArray(s.list)
        ? s.list.map(String)
        : []
  ).filter(Boolean);

  if (multSrc.length) {
    const points = $('.header-line .point');
    points.each((i, el) => {
      if (multSrc[i] != null) {
        const val = String(multSrc[i]).trim();
        // форматируем как "x1.23"
        $(el)
          .contents()
          .filter(function () {
            // оставим внутри только текстовый узел после .point-dot
            return this.type === 'text';
          })
          .remove();
        $(el).append(`x${val}`);
      }
    });
  }

  // 5) Модалки
  //   Основная:
  setText($, '#modal .modal__title', payload.effects?.modal?.title || '');
  setText($, '#modal .modal__text', payload.effects?.modal?.text || '');
  setText($, '#win-button-modal span', payload.effects?.modal?.button || '');

  applyBonuses($, s.bonuses);

  // 6) Безопасный init (если у commonPenalty есть глобальный инитер)
  appendInitScript(
    $,
    `
      var rateEl = document.getElementById('rate');
      var balEl  = document.getElementById('balance');

      var cfg = {
        rate: rateEl?.dataset?.rate || rateEl?.textContent || '',
        balanceMin: balEl?.dataset?.balancemin || balEl?.textContent || '',
        balanceMax: balEl?.dataset?.balancemax || '',
        currencySymbol: rateEl?.previousElementSibling?.textContent || ''
      };

      if (typeof window.initPenalty === 'function') {
        window.initPenalty(cfg);
      }
    `
  );

  return $;
}
