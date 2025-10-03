import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { PreviewDto } from './dto/preview.dto';
import { renderAviator } from './renderers/aviator';
import { renderBalloon } from './renderers/balloon';
import { renderChickenRoad } from './renderers/chickenRoad';
import { renderCrash } from './renderers/crash';
import { renderIpl } from './renderers/ipl';
import { renderMines } from './renderers/mines';
import { renderPenalty } from './renderers/penalty';
import { renderPlinko } from './renderers/plinko';
import { renderScratch } from './renderers/scratch';
import { renderSlots } from './renderers/slots';
import { renderWheels } from './renderers/wheels';

@Injectable()
export class PreviewService {
  private tplRoot = path.join(process.cwd(), 'templates');

  async render(payload: PreviewDto): Promise<string> {
    // имя HTML файла: /templates/<template>.html
    const htmlPath = path.join(this.tplRoot, `${payload.template.replace(/[^\w-]/g, '')}.html`);
    const html = await fs.readFile(htmlPath, 'utf8');
    let $ = cheerio.load(html);

    // общий минимум (если надо что-то до рендера игры)
    $('html').attr('lang', payload.locale || 'en');

    switch (payload.gameType) {
      case 'wheels':
        $ = renderWheels($, payload);
        break;
      case 'slots':
        $ = renderSlots($, payload);
        break;
      case 'plinko':
        $ = renderPlinko($, payload);
        break;
      case 'penalty':
        $ = renderPenalty($, payload);
        break;
      case 'aviator':
        $ = renderAviator($, payload);
        break;
      case 'scratch':
        $ = renderScratch($, payload);
        break;
      case 'chickenRoad':
        $ = renderChickenRoad($, payload);
        break;
      case 'balloon':
        $ = renderBalloon($, payload);
        break;
      case 'ipl':
        $ = renderIpl($, payload);
        break;
      case 'mines':
        $ = renderMines($, payload);
        break;
      case 'crash':
        $ = renderCrash($, payload);
        break;
      default:
        $ = renderWheels($, payload);
    }
    return $.html();
  }
}
