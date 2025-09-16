import * as cheerio from 'cheerio';

import { PreviewDto } from '../dto/preview.dto';
import { appendInitScript, applyBonuses, setAttr, setText } from '../utils/utils';

export function renderScratch($: cheerio.CheerioAPI, payload: PreviewDto) {
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

  const s: any = payload.sectors || {};

  // --- Описание под карточками
  if (s.scratchDescription != null) {
    setText($, '.scratch-description', s.scratchDescription);
  }

  // --- Валюта
  if (s.currency) {
    setAttr($, '.scratch-container', 'data-currency', String(s.currency));
  }

  // --- Обложка (картинка поверх, которую нужно «снимать»)
  // Поддержим оба возможных поля конфигурации
  const imageForward =
    s.imageForward ||
    s.scratchImageForward ||
    $('.scratch-container').attr('data-image-forward') ||
    '';
  if (imageForward) {
    setAttr($, '.scratch-container', 'data-image-forward', String(imageForward));
  }

  // --- Три бонуса на карточки
  const bonuses = (Array.isArray(s.scratchBonuses) ? s.scratchBonuses.slice(0, 3) : []).map(String);
  if (bonuses.length) {
    setAttr($, '.scratch-container', 'data-bonuses', bonuses.join(','));

    const cardEls = $('.scratch-cards').find('.scratch-cards__item'); // 3 штуки (1-я вложена в .scratch-cards__explication)
    cardEls.each((i, el) => {
      const $el = $(el);
      // пометим индексом, чтобы накинуть кастомные размеры шрифтов
      $el.attr('data-scratch-index', String(i + 1));
      // гарантируем видимый текст (на случай, если фронтовый скрипт не подставит)
      if ($el.find('.inner-html .bonus-item').length === 0) {
        $el.append('<div class="inner-html"><span class="bonus-item"></span></div>');
      }
      const text = bonuses[i] ?? '';
      $el.find('.bonus-item').text(text);
    });

    // Пробрасываем data-image-forward на каждую карточку (часть сборок ищет его на item)
    if (imageForward) {
      cardEls.each((_, el) => {
        $(el).attr('data-image-forward', String(imageForward));
      });
    }

    // подкинем стиль для индивидуальных размеров (если заданы)
    const css: string[] = [];
    if (s.fontSizeScratchSectorFirst)
      css.push(
        `.scratch-cards__item[data-scratch-index="1"] .bonus-item{font-size:${s.fontSizeScratchSectorFirst} !important;}`
      );
    if (s.fontSizeScratchSectorSecond)
      css.push(
        `.scratch-cards__item[data-scratch-index="2"] .bonus-item{font-size:${s.fontSizeScratchSectorSecond} !important;}`
      );
    if (s.fontSizeScratchSectorThird)
      css.push(
        `.scratch-cards__item[data-scratch-index="3"] .bonus-item{font-size:${s.fontSizeScratchSectorThird} !important;}`
      );
    if (css.length) $('head').append(`<style id="scratch-font-sizes">${css.join('\n')}</style>`);
  }

  // --- Фикс-стили, чтобы канвас был сверху и ловил события, а текст — не перехватывал
  $('head').append(`
    <style id="scratch-fixes">
      .scratch-cards__item{ position: relative; }
      .scratch-cards__item canvas{
        position: absolute !important;
        inset: 0 !important;
        z-index: 3 !important;
        display: block;
        width: 100% !important;
        height: 100% !important;
      }
      .scratch-cards__item .inner-html{
        position: relative;
        z-index: 2;
        pointer-events: none;
      }
      .scratch-cards__item img{
        position: absolute;
        inset: 0;
        z-index: 1;
      }
    </style>
  `);

  // --- Модалка выигрыша
  setText($, '#modal .modal__title span', payload.effects?.modal?.title ?? '');
  setText($, '#modal .modal__text span', payload.effects?.modal?.text ?? '');
  setText($, '#win-button-modal span', payload.effects?.modal?.button ?? '');

  // --- Общие бонусы (inline, onPageLeave, gif, тексты)
  applyBonuses($, s.bonuses);

  // --- Безопасный init: ждём полной загрузки
  appendInitScript(
    $,
    `
      window.addEventListener('load', function(){
        try {
          var root = document.querySelector('.scratch-container');
          var cfg = {
            currency: root?.dataset?.currency || '',
            bonuses: (root?.dataset?.bonuses || '').split(',').filter(Boolean),
            imageForward: root?.dataset?.imageForward || ''
          };
          if (typeof window.initScratch === 'function') {
            window.initScratch(cfg);
          } else {
            console.warn('[scratch] initScratch не найден. Проверь порядок скриптов: scratchCard.min.js -> commonScratch.min.js -> тема app.min.js');
          }
        } catch(e){
          console.error('[scratch] ошибка инициализации', e);
        }
      });
    `
  );

  return $;
}
