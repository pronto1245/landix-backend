import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class WhitePageService {
  private template: string;

  constructor() {
    const templatePath = join(process.cwd(), 'templates/whitePages/page1.html');

    this.template = readFileSync(templatePath, 'utf8');
  }

  render(domain: string): string {
    return this.template.replaceAll('{DOMAIN}', domain);
  }
}
