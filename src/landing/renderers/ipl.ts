import * as cheerio from 'cheerio';

import { PreviewDto } from '../dto/preview.dto';
import { appendInitScript, applyBonuses, setAttr, setText } from '../utils/utils';

export function renderIpl($: cheerio.CheerioAPI, payload: PreviewDto) {
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
  setAttr($, '#go-btn', 'data-spins', String(payload.spins ?? 1));

  // --- СЕГМЕНТЫ / контент ---
  const s = payload.sectors || {};
  const free = s.freeBet || {};

  // Заголовок/текст в центре
  if (free.title != null) setText($, '.content__title span', String(free.title));
  if (free.text != null) setText($, '.content__text span', String(free.text));

  // Заголовок списка
  if (free.list?.title != null) {
    setText($, '.content__list-title span', String(free.list.title));
  }

  // Пункты списка (берём столько, сколько есть в верстке)
  const items: string[] = Array.isArray(free.list?.items) ? free.list!.items.map(String) : [];
  if (items.length) {
    const lis = $('.content__list-items .content__list-item');
    lis.each((i, el) => {
      const txt = items[i] ?? '';
      $(el).find('p').text(txt);
    });
  }

  // --- Модалка выигрыша ---
  setText($, '#modal .modal__title span', payload.effects?.modal?.title ?? '');
  setText($, '#modal .modal__text span', payload.effects?.modal?.text ?? '');
  setText($, '#win-button-modal span', payload.effects?.modal?.button ?? '');

  // --- Общие бонусы (inline, onPageLeave, gif, тексты) ---
  applyBonuses($, s.bonuses);

  // --- Безопасный init (легкий лог, тема сама читает DOM) ---
  appendInitScript(
    $,
    `
      (function(){
        try {
          window.addEventListener('load', function(){
            try {
              console.log('[iplFreebetGreen] preview init OK');
            } catch(e){
              console.warn('[iplFreebetGreen] init error', e);
            }
          });
        } catch(e){}
      })();
    `
  );

  return $;
}
