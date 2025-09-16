// src/preview/renderers/plinko.ts
import * as cheerio from 'cheerio';

import { PreviewDto } from '../dto/preview.dto';
import { appendInitScript, applyBonuses, setAttr, setText } from '../utils/utils';

export function renderPlinko($: cheerio.CheerioAPI, payload: PreviewDto) {
  // убрать жёсткий initPlinko(...)
  const cleaned = $.html().replace(/initPlinko\([^)]*\)\s*;?/g, '');
  const $$ = cheerio.load(cleaned);
  $ = $$;

  // meta / title
  $('html').attr('lang', payload.locale || 'en');
  setText($, 'title', payload.title || '');
  setAttr($, 'meta[name="Description"]', 'content', payload.description || '');
  setAttr($, 'meta[name="apple-mobile-web-app-title"]', 'content', payload.title || '');

  // CTA
  setText($, '#go-btn-default-text', payload.buttonDefault || '');
  setText($, '#go-btn-next-text', payload.buttonNext || '');
  setText($, '#go-btn-win-text', payload.buttonWin || '');
  setAttr($, '#go-btn', 'data-spins', String(payload.spins ?? 1));

  const s = payload.sectors || {};
  const payoutsStr = (s.list ?? []).map(String);
  const payoutsCsv = payoutsStr.join(',');

  const isAztec = $('#game').length > 0; // вариант 1
  const isTraff = $('#plinko-game-traff').length > 0; // вариант 2 (твой новый)

  /** Общие UI-лейблы/значения */
  if (s.rateText)
    setText(
      $,
      '.game-controls__bet-label, .plinko-game-traff__bottom-section:first-child > span:first-child',
      s.rateText
    );
  if (s.balanceText)
    setText(
      $,
      '.game-controls__win-label, .plinko-game-traff__bottom-section:last-child > span:first-child',
      s.balanceText
    );

  /** ВАЛЮТА (символ) */
  // aztec: отдельные элементы .game-controls__*currency
  if (s.currencySymbol) {
    setText($, '.game-controls__bet-value-currency', s.currencySymbol);
    setText($, '.game-controls__win-value-currency', s.currencySymbol);
  }
  // traff: символ — это ССЫЛЬНЫЙ предыдущий <span> перед #rate/#balance
  const $rateVal = $('#rate');
  const $balVal = $('#balance');
  if ($rateVal.length && s.currencySymbol) {
    const $cur = $rateVal.prev('span');
    if ($cur.length) $cur.text(String(s.currencySymbol));
  }
  if ($balVal.length && s.currencySymbol) {
    const $cur = $balVal.prev('span');
    if ($cur.length) $cur.text(String(s.currencySymbol));
  }

  /** ЗНАЧЕНИЯ rate/balance */
  if (isAztec) {
    if (s.rate != null) setText($, '.game-controls__bet-value-count', String(s.rate));
    if (s.balanceMin != null) setText($, '#game-win-balance', String(s.balanceMin));
  }
  if (isTraff) {
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
  }

  /** PAYOUTS */
  if (isAztec) {
    const $game = $('#game');
    if ($game.length) {
      if (s.rate != null) $game.attr('data-rate', String(s.rate));
      if (payoutsStr.length) $game.attr('data-list', payoutsCsv);
      if (s.balanceMin != null) $game.attr('data-balancemin', String(s.balanceMin));
      if (s.balanceMax != null) $game.attr('data-balancemax', String(s.balanceMax));
    }
    // подписи слотов
    if (payoutsStr.length) {
      $('.game-field__slots-item span').each((i, el) => {
        if (payoutsStr[i] != null) $(el).text(payoutsStr[i]);
      });
    }
  }

  if (isTraff) {
    // подписи мультипликаторов внизу пирамиды
    if (payoutsStr.length) {
      $('.plinko-game-traff__multipliers-row-item span').each((i, el) => {
        if (payoutsStr[i] != null) $(el).text(payoutsStr[i]);
      });
    }
    // некоторые commonPlinko сборки берут payouts из разметки; дополнительно кладём на body
    if (payoutsStr.length) {
      $('body').attr('data-plinko-payouts', JSON.stringify(payoutsStr.map((x) => Number(x))));
    }
  }

  /** Модалки */
  // aztec-модалка
  setText(
    $,
    '#modal .modal__title span, #plinkoModal .modal__title span',
    payload.effects?.modal?.title || ''
  );
  setText(
    $,
    '#modal .modal__text span,  #plinkoModal .modal__text span',
    payload.effects?.modal?.text || ''
  );
  setText(
    $,
    '#win-button-modal span,    #win-plinko-button-modal span',
    payload.effects?.modal?.button || ''
  );

  // traff-модалка (тексты в p.first / p.first-1; кнопки — span внутри #win-button-modal и #win-bonus-button-modal)
  if (isTraff) {
    // основная win-модалка
    setText(
      $,
      '.plinko-game-traff__second-modal .plinko-game-traff__modal-text .first',
      payload.effects?.modal?.title || ''
    );
    setText(
      $,
      '.plinko-game-traff__second-modal .plinko-game-traff__modal-text .first-1',
      payload.effects?.modal?.text || ''
    );
    setText($, '#win-button-modal span', payload.effects?.modal?.button || '');

    // бонусная модалка
    setText($, '#bonusModal .plinko-game-traff__modal-text .first', s.bonuses?.modal?.title || '');
    setText($, '#bonusModal .plinko-game-traff__modal-text .first-1', s.bonuses?.modal?.text || '');
    setText($, '#win-bonus-button-modal span', s.bonuses?.modal?.button || '');
  }

  applyBonuses($, payload.sectors?.bonuses);

  /** Безопасный init (читает либо из body, либо из конкретной разметки шаблона) */
  appendInitScript(
    $,
    `
      var root = document.body;
      var game = document.getElementById('game');
      var rateEl = document.getElementById('rate');
      var balEl  = document.getElementById('balance');

      function readPayouts(){
        try {
          var fromRoot = JSON.parse(root?.dataset?.plinkoPayouts || '[]');
          if (Array.isArray(fromRoot) && fromRoot.length) return fromRoot;
        } catch(_) {}

        // aztec-CSV из #game
        var csv = game?.getAttribute('data-list') || '';
        if (csv) {
          return csv.split(',').map(function(x){ var n = Number(x); return isNaN(n)?x:n; }).filter(Boolean);
        }

        // traff — из DOM низов пирамиды
        var spans = document.querySelectorAll('.plinko-game-traff__multipliers-row-item span');
        if (spans && spans.length) {
          return Array.from(spans).map(function(el){
            var t = el.textContent?.trim() || '';
            var n = Number(t);
            return isNaN(n) ? t : n;
          });
        }
        return [];
      }

      var cfg = {
        payouts: readPayouts(),
        rate: (game?.getAttribute('data-rate') || rateEl?.dataset?.rate || ''),
        currency: '',
        currencySymbol: (document.querySelector('.game-controls__bet-value-currency')?.textContent || rateEl?.previousElementSibling?.textContent || ''),
        balanceMin: (game?.getAttribute('data-balancemin') || balEl?.dataset?.balancemin || ''),
        balanceMax: (game?.getAttribute('data-balancemax') || balEl?.dataset?.balancemax || '')
      };

      if (typeof window.initPlinko === 'function') {
        window.initPlinko(cfg);
      }
    `
  );

  return $;
}
