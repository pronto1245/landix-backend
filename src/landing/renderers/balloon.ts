import * as cheerio from 'cheerio';

import { PreviewDto } from '../dto/preview.dto';
import { appendInitScript, applyBonuses, setAttr, setText } from '../utils/utils';

export function renderBalloon($: cheerio.CheerioAPI, payload: PreviewDto) {
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

  // --- Сектора / параметры ---
  const s = payload.sectors || {};
  const bonusesCfg = s.bonuses || {};

  // Ставка (если нужна где-то в data-атрибутах/DOM)
  if (s.rate != null) {
    const rateStr = String(s.rate);
    // В balloon ставка живёт в логике приложения, но подстрахуемся
    setAttr($, '#game', 'data-rate', rateStr);
  }

  // Валюта (символ только где он есть в DOM — тут минимум)
  if (s.currencySymbol != null) {
    // Здесь явных мест с символом мало — бонусные/модальные части не показывают валюту
    // Если добавишь элементы – подставляй сюда
  }

  // --- ОСНОВНАЯ модалка выигрыша (id="modal") из payload.effects.modal ---
  if (payload.effects?.modal) {
    setText($, '#modal .modal__content-title span', payload.effects.modal.title ?? '');
    setText($, '#modal .modal__content-text span', payload.effects.modal.text ?? '');
    // Текст на кнопке основной модалки выигрыша
    const winBtn = payload.effects.modal.button ?? payload.buttonWin ?? '';
    setText($, '#win-button-modal span', winBtn);
  } else {
    // Если effects.modal нет — хотя бы кнопку заполним из buttonWin
    setText($, '#win-button-modal span', payload.buttonWin ?? '');
  }

  // --- БОНУСНАЯ модалка (id="bonusModal") из sectors.bonuses.modal ---
  if (bonusesCfg?.modal) {
    setText($, '#bonusModal .modal__content-title span', bonusesCfg.modal.title ?? '');
    setText($, '#bonusModal .modal__content-text span', bonusesCfg.modal.text ?? '');
    setText($, '#win-bonus-button-modal span', bonusesCfg.modal.button ?? '');
  }

  // --- INLINE БОНУС БЛОК (id="bonus-inline"): если его нет — создаём
  if ($('#bonus-inline').length === 0) {
    const inlineHtml = `
      <div class="bonus-inline is--hidden" id="bonus-inline">
        <a class="clickable-inline-box-element" href="#"></a>
        <div class="bonus-inline__wrapper">
          <div class="bonus-inline__arrows" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M14 7l-5 5 5 5"/></svg>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M14 7l-5 5 5 5"/></svg>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M14 7l-5 5 5 5"/></svg>
          </div>
          <img id="bonus-inline-gif" src="" alt="bonus"/>
          <p id="bonus-inline-text"></p>
        </div>
      </div>
    `;
    // В balloon удобнее в body-wrapper
    $('.body-wrapper').append(inlineHtml);
  }

  // Проставим гиф/текст для inline бокса
  if (bonusesCfg) {
    const gifUrl = bonusesCfg.gif
      ? `https://landix.group/assets/general/images/bonus/${bonusesCfg.gif}`
      : '';
    if (gifUrl) $('#bonus-inline-gif').attr('src', gifUrl);
    setText($, '#bonus-inline-text', bonusesCfg.inlineBoxText ?? '');
  }

  // --- LEAVE-БОНУС (id="bonusOnPageLeave"): если его нет — создаём
  if ($('#bonusOnPageLeave').length === 0) {
    const leaveHtml = `
      <div class="bonuses-wrapper" id="bonusOnPageLeave">
        <img id="bonus-leave-gif" src="" alt="bonus">
        <h3 id="bonus-leave-text"></h3>
        <!-- Можно добавить кнопку, если требуется: <button class="bottom__section-button is--link">...</button> -->
      </div>
    `;
    $('body').append(leaveHtml);
  }

  // Проставим гиф/текст для leave-модалки
  if (bonusesCfg) {
    const gifUrl = bonusesCfg.gif
      ? `https://landix.group/assets/general/images/bonus/${bonusesCfg.gif}`
      : '';
    if (gifUrl) $('#bonus-leave-gif').attr('src', gifUrl);
    setText($, '#bonus-leave-text', bonusesCfg.activeOnPageLeaveText ?? '');
  }

  // --- Прогоним общий хелпер (он мог быть нужен для Gif/модалок и т.п.)
  // Внутри applyBonuses ничего лишнего — можно вызывать.
  applyBonuses($, s.bonuses);

  // --- Мини-скрипт, который мягко активирует inline/leave по флагам,
  //     если общий commonBonuses вдруг не подцепится (фоллбек)
  const inlineActive = !!bonusesCfg?.activeOnPageLoaded;
  const leaveActive = !!bonusesCfg?.activeOnPageLeave;

  appendInitScript(
    $,
    `
    (function(){
      try {
        var inline = document.getElementById('bonus-inline');
        if (inline) {
          if (${inlineActive}) {
            inline.classList.remove('is--hidden');
            inline.classList.add('is--active');
          } else {
            inline.classList.remove('is--active');
            inline.classList.add('is--hidden');
          }
        }

        // Фоллбек для leave-модалки (если общий скрипт не сработал)
        var leaveOn = ${leaveActive};
        var wrapper = document.getElementById('bonusOnPageLeave');
        var armed = true;
        if (wrapper) {
          if (leaveOn) {
            window.addEventListener('mouseleave', function (ev) {
              if (!armed) return;
              if (ev.clientY <= 0) {
                wrapper.classList.add('is--active');
                armed = false;
              }
            }, { once: true });
          } else {
            wrapper.classList.remove('is--active');
          }
        }
      } catch(e){}
    })();
    `
  );

  return $;
}
