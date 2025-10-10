import * as cheerio from 'cheerio';

import { PreviewDto } from '../dto/preview.dto';
import { appendInitScript, applyBonuses, setAttr, setText } from '../utils/utils';

/**
 * Рендерит тему "crash" (одна версия).
 * Ожидает структуру payload, как в предыдущих слотах:
 * - payload.buttonDefault / buttonNext / buttonWin
 * - payload.spins
 * - payload.effects?.modal?.title / .text / .button
 * - payload.sectors: { rate, currency, currencySymbol, buttonCashOut, multipliers, bonuses }
 */
export function renderCrash($: cheerio.CheerioAPI, payload: PreviewDto) {
  // Создаём локальную копию DOM, чтобы работать «чисто»
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
  setText($, '#go-btn-default-text', payload.buttonDefault ?? '');
  setText($, '#go-btn-next-text', payload.buttonNext ?? '');
  setAttr($, '#go-btn', 'data-spins', String(payload.spins ?? 1));

  const s = payload.sectors || {};
  const currencySym = (s.currencySymbol ?? '').toString();
  const currencyCode = (s.currency ?? '').toString();

  // --- Инициализация ставки/валюты на корневом .game ---
  if (s.rate != null) {
    // data-rate на .game
    setAttr($, '.game#game', 'data-rate', String(s.rate));
  }
  // data-multipliers на .game (ожидает строку через запятую)
  if (Array.isArray(s.multipliers) && s.multipliers.length) {
    setAttr($, '.game#game', 'data-multipliers', s.multipliers.join(','));
  }

  // --- Хедер справа: баланс и валюта (плашка "100 USD") ---
  // В верстке: <div class="game-header__balance"><span id="game-wallet">100</span> USD</div>
  if (currencySym || currencyCode) {
    const cur = currencySym || currencyCode;
    const $hdr = $('.game-header__balance');
    if ($hdr.length) {
      // Текст после #game-wallet — это валюта. Заменим на наш символ/код.
      // Проще — обернуть валюту в span если её нет, но мы аккуратно почистим узлы после #game-wallet
      const wallet = $('#game-wallet');
      if (wallet.length) {
        // Заменим содержимое всего контейнера на «<span id="game-wallet">X</span> CUR»
        const val = wallet.text() || '100';
        $hdr.html(`<span id="game-wallet">${val}</span> ${cur}`);
      }
    }
  }

  // --- Блок ставки: метка "Bet USD" и значение ---
  // .game-controls__bet-field-label -> "Bet USD"
  // .game-controls__bet-field-value > span -> "100"
  if ($('.game-controls__bet-field').length) {
    const cur = currencySym || currencyCode || '';
    const labelText = cur ? `Bet ${cur}` : 'Bet';
    setText($, '.game-controls__bet-field-label', labelText);

    if (s.rate != null) {
      setText($, '.game-controls__bet-field-value > span', String(s.rate));
    }
  }

  // --- Кнопка CASH OUT: текст и валюта "---"
  // Вёрстка: <button id="game-cash-btn">... <div><span id="game-balance">0</span> USD</div>
  if (s.buttonCashOut) {
    // Текст "CASH OUT" лежит в первом <span> внутри .game-controls__buttons-cash-inner
    const cashInner = $('.game-controls__buttons-cash-inner');
    if (cashInner.length) {
      const firstSpan = cashInner.find('> span').first();
      if (firstSpan.length) {
        firstSpan.text(` ${s.buttonCashOut}`);
      }
    }
  }
  if (currencySym || currencyCode) {
    const cur = currencySym || currencyCode;
    const cashVal = $('.game-controls__buttons-cash-value');
    if (cashVal.length) {
      const balanceSpan = cashVal.find('#game-balance');
      const balanceText = balanceSpan.length ? balanceSpan.text() : '0';
      cashVal.html(`<span id="game-balance">${balanceText}</span> ${cur}`);
    }
  }

  // --- Модалка выигрыша (заголовок, кнопка, валюта баланса) ---
  // Заголовок
  setText($, '#modal .modal__title span', payload.effects?.modal?.title ?? '');
  // Валюта в сумме (+ <span id="modal-balance">2450</span> <span class="modal__balance-currency">USD</span>)
  if (currencySym || currencyCode) {
    setText($, '#modal .modal__balance .modal__balance-currency', currencySym || currencyCode);
  }
  // Текст кнопки в модалке: приоритет effects.modal.button, иначе общий buttonWin
  const winBtnText = payload.effects?.modal?.button ?? payload.buttonWin ?? '';
  setText($, '#win-button-modal span', winBtnText);

  // --- Общие бонусы (inline, onPageLeave, gif, тексты) ---
  applyBonuses($, s.bonuses);

  // --- Безопасный init (если в теме есть window.initCrash) ---
  appendInitScript(
    $,
    `
			(function(){
				try {
					var root = document.querySelector('.game#game');
					var cfg = {
						rate: root?.dataset?.rate || '',
						multipliers: (root?.dataset?.multipliers || '').split(',').filter(Boolean),
						currency: ${JSON.stringify(currencyCode)},
						currencySymbol: ${JSON.stringify(currencySym)}
					};
					if (typeof window.initCrash === 'function') {
						window.initCrash(cfg);
					} 
				} catch(e){}
			})();
		`
  );

  return $;
}
