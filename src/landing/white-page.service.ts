import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class WhitePageService {
  private template: string;

  constructor() {
    // Абсолютный путь до templates/whitePages/default.html
    const templatePath = join(process.cwd(), 'templates/whitePages/page1.html');

    this.template = readFileSync(templatePath, 'utf8');
  }

  getDomain(req: Request): string {
    const host = (req.headers['x-forwarded-host'] as string | undefined) ?? req.headers.host ?? '';

    return host.split(':')[0].toLowerCase();
  }

  render(req: Request): string {
    const domain = this.getDomain(req);
    return this.template.replaceAll('{DOMAIN}', domain);
  }
}
