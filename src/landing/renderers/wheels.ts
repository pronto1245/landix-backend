// src/preview/renderers/wheels.ts
import * as cheerio from 'cheerio';

import { PreviewDto } from '../dto/preview.dto';
import { appendInitScript, applyBonuses, setAttr, setText } from '../utils/utils';

export function renderWheels($: cheerio.CheerioAPI, payload: PreviewDto) {
  // вырезаем жёсткий запуск spinWheel(...)
  const cleaned = $.html().replace(/spinWheel\([^)]*\)\s*;?/g, '');
  const $$ = cheerio.load(cleaned);
  $ = $$; // перезаливаем документ

  // --- meta / title / lang ---
  $('html').attr('lang', payload.locale || 'en');
  setText($, 'title', payload.title || '');
  setAttr($, 'meta[name="Description"]', 'content', payload.description || '');
  setAttr($, 'meta[name="apple-mobile-web-app-title"]', 'content', payload.title || '');

  // --- CTA / spins ---
  setText($, '#go-btn-default-text', payload.buttonDefault || '');
  setText($, '#go-btn-next-text', payload.buttonNext || '');
  setAttr($, '#go-btn', 'data-spins', String(payload.spins ?? 1));

  // --- sectors (8 блоков) ---
  const list = (payload.sectors?.list ?? []) as Array<{ first?: string; second?: string }>;
  const fs1 = payload.sectors?.fontSizeFirstText ?? '1.5em';
  const fs2 = payload.sectors?.fontSizeSecondText ?? '2em';

  for (let i = 0; i < 8; i++) {
    const item = list[i] || {};
    const block = $(`.wheel__texts-${i + 1}`); // div.wheel__texts-1 и т.д.
    if (!block.length) continue;
    block.empty();
    if (item.first) {
      block.append(`
        <p class="wheel__texts-${i + 1}-first" style="font-size:${fs1}">${item.first}</p>
      `);
    }
    if (item.second) {
      block.append(`
        <p class="wheel__texts-${i + 1}-second" style="font-size:${fs2}">${item.second}</p>
      `);
    }
  }

  // --- модалка выигрыша ---
  setText($, '#modal .modal__title span', payload.effects?.modal?.title || '');
  setText($, '#modal .modal__text span', payload.effects?.modal?.text || '');
  setText($, '#win-button-modal span', payload.effects?.modal?.button || '');

  // --- бонусы ---
  applyBonuses($, payload.sectors?.bonuses);

  // --- безопасный init
  appendInitScript(
    $,
    `
      var el = document.getElementById('go-btn');
      var spins = Number((el && el.dataset && el.dataset.spins) || 1);
      if (typeof window.spinWheel === 'function') {
        window.spinWheel(spins, true, '');
      }
    `
  );

  return $;
}
