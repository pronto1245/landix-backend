// src/preview/utils.ts
import * as cheerio from 'cheerio';

export const setText = ($: cheerio.CheerioAPI, sel: string, text?: string) => {
  if (text == null) return;
  const el = $(sel);
  if (el.length) el.text(String(text));
};

export const setAttr = (
  $: cheerio.CheerioAPI,
  sel: string,
  name: string,
  val?: boolean | number | string
) => {
  if (val == null) return;
  const el = $(sel);
  if (el.length) el.attr(name, String(val));
};

export const appendInitScript = ($: cheerio.CheerioAPI, js: string) => {
  $('body').append(`<script>(function(){try{${js}}catch(e){}})();</script>`);
};

export function applyBonuses($: cheerio.CheerioAPI, b?: any) {
  if (!b) return;

  // 1) Текст инлайнового бокса
  if (b.inlineBoxText) {
    const el = $('#bonus-inline p');
    if (el.length) el.text(b.inlineBoxText);
  }

  // 2) Флаги активностей
  //    a) на уход со страницы (dataset читают commonBonuses скрипты)
  if (typeof b.activeOnPageLeave === 'boolean') {
    $('#bonuses-activeOnPageLeave').attr(
      'data-bonuses-activeOnPageLeave',
      String(b.activeOnPageLeave)
    );
  }
  //    b) на загрузке страницы — сохраним тоже в dataset (на случай, если это читает общий скрипт)
  if (typeof b.activeOnPageLoaded === 'boolean') {
    $('#bonuses-activeOnPageLeave').attr(
      'data-bonuses-activeOnPageLoaded',
      String(b.activeOnPageLoaded)
    );
  }

  // 3) Заголовок модалки при уходе (если макет поддерживает)
  if (b.activeOnPageLeaveText) {
    const el = $('#bonusOnPageLeave .modal__title');
    if (el.length) el.text(b.activeOnPageLeaveText);
  }

  // 4) Замена gif в inline и leave-блоках (меняем только имя файла в конце пути)
  const replaceGif = (sel: string) => {
    if (!b.gif) return;
    const img = $(sel);
    if (!img.length) return;
    const src = img.attr('src');
    if (!src) return;
    img.attr('src', src.replace(/[^/]+$/, String(b.gif)));
  };
  replaceGif('#bonusOnPageLeave img');
  replaceGif('#bonus-inline img');

  // 5) Тексты бонусной модалки, если есть
  if (b.modal) {
    if (b.modal.title) $('#bonusModal .modal__title').text(b.modal.title);
    if (b.modal.text) $('#bonusModal .modal__text').text(b.modal.text);
    if (b.modal.button) $('#win-bonus-button-modal span').text(b.modal.button);
  }

  // 6) Поведение из флагов (fallback, если общий commonBonuses это не делает сам):
  //    - activeOnPageLoaded: показать/спрятать inline-бокс.
  //    - activeOnPageLeave: показать модалку при попытке уйти мышкой (desktop), если общий скрипт не ловит.
  const activeOnLoad = !!b.activeOnPageLoaded;
  const activeOnLeave = !!b.activeOnPageLeave;

  $('body').append(`
    <script>
      (function(){
        try {
          var inline = document.getElementById('bonus-inline');
          if (inline) {
            if (${activeOnLoad}) {
              inline.classList.remove('is--hidden');
              inline.classList.add('is--active');
            } else {
              inline.classList.remove('is--active');
              inline.classList.add('is--hidden');
            }
          }
          // Фоллбек для leave-модалки (если общий скрипт не сработал)
          if (${activeOnLeave}) {
            var wrapper = document.getElementById('bonusOnPageLeave');
            var armed = true;
            if (wrapper) {
              // покажем один раз по "вылету" курсора за пределы окна
              window.addEventListener('mouseleave', function(ev){
                if (!armed) return;
                if (ev.clientY <= 0) {
                  wrapper.classList.add('is--active');
                  armed = false;
                }
              }, { once: true });
            }
          } else {
            var wrapper = document.getElementById('bonusOnPageLeave');
            if (wrapper) wrapper.classList.remove('is--active');
          }
        } catch(e){}
      })();
    </script>
  `);
}
