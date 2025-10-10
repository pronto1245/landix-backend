import * as cheerio from 'cheerio';

import { PreviewDto } from '../dto/preview.dto';
import { applyBonuses, setAttr, setText } from '../utils/utils';

export function renderChickenRoad($: cheerio.CheerioAPI, payload: PreviewDto) {
  const $$ = cheerio.load($.html());
  $ = $$;

  // ===== META / TITLE =====
  $('html').attr('lang', payload.locale || 'en');
  setText($, 'title', payload.title || '');
  setAttr($, 'meta[name="Description"]', 'content', payload.description || '');
  setAttr(
    $,
    'meta[name="apple-mobile-web-app-title"]',
    'content',
    payload.pwaName || payload.title || ''
  );

  // ===== CTA / SPINS =====
  setText($, '#go-btn-default-text', payload.buttonDefault ?? '');
  setText($, '#go-btn-next-text', payload.buttonNext ?? '');
  setText($, '#go-btn-win-text', payload.buttonWin ?? '');
  setAttr($, '#go-btn', 'data-spins', String(payload.spins ?? 1));

  // ===== SECTORS / CONTROLS =====
  const s = payload.sectors || {};
  const rateStr = s.rate != null ? String(s.rate) : undefined;
  const currencySymbol = s.currencySymbol ?? '';
  const multipliers: string[] = Array.isArray(s.multipliers) ? s.multipliers.map(String) : [];

  // Rate (число в центре контролов и data-атрибут)
  if (rateStr) {
    setText($, '#rate', rateStr);
    setAttr($, '#rate', 'data-rate', rateStr);
  }

  // Cash Out (текст кнопки + баланс + символ валюты)
  if (s.buttonCashOut != null || rateStr != null || currencySymbol != null) {
    const $cashInner = $('.game-controls__cash-btn-inner');
    if ($cashInner.length) {
      const outLabel = (
        s.buttonCashOut ??
        $cashInner.find('> span').first().text() ??
        'CASH OUT'
      ).toString();
      const currentBalance = rateStr ?? ($cashInner.find('#balance').text() || '');
      $cashInner.html(
        `<span>${outLabel}</span><br/><span id="balance">${currentBalance}</span> ${currencySymbol ?? ''}`
      );
    }
  }

  // Пресеты ставок – только символ валюты (значения оставляем как есть)
  if (currencySymbol !== null && currencySymbol !== undefined) {
    $('.game-controls__defaults .game-controls__defaults-item-currency').each((_, el) => {
      $(el).text(currencySymbol);
    });
  }

  // Мультипликаторы: пишем в data-атрибут и в сами сектора (span внутри .game__sector-multify-value)
  if (multipliers.length) {
    setAttr($, '#rate', 'data-multipliers', multipliers.join(','));

    const $sectorEls = $('.game__field .game__sector');
    $sectorEls.each((i, el) => {
      const m = multipliers[i] ?? multipliers[multipliers.length - 1];
      $(el).find('.game__sector-multify-value span').text(m);
    });

    // Мультипликатор в модалке (берём последний)
    setText($, '#modal-multiplier', multipliers[multipliers.length - 1] || '');
  }

  // ===== MODAL (WIN) =====
  // Заголовок
  setText($, '#modal .modal__title span', payload.effects?.modal?.title ?? '');
  // Валюта в модалке
  setText($, '#modal .modal__balance .modal__balance-currency', currencySymbol ?? '');

  // Сумма выигрыша (если есть ставка и мультипликатор)
  try {
    if (rateStr && multipliers.length) {
      const r = Number.parseFloat(rateStr.replace(',', '.'));
      const m = Number.parseFloat((multipliers[multipliers.length - 1] || '1').replace(',', '.'));
      if (!Number.isNaN(r) && !Number.isNaN(m)) {
        const win = r * m;
        // Безопасно округлим до 2 знаков (или целое, если без центов)
        const pretty =
          Math.abs(win - Math.round(win)) < 1e-9
            ? String(Math.round(win))
            : String(Math.round(win * 100) / 100);
        setText($, '#modal-balance', pretty);
      }
    }
  } catch (e) {
    console.warn(e);
  }

  {
    const bonusBtnText = s?.bonuses?.modal?.button ?? payload.effects?.modal?.button ?? '';
    if (bonusBtnText) setText($, '#win-button-modal span', bonusBtnText);
  }

  applyBonuses($, s.bonuses);

  return $;
}
