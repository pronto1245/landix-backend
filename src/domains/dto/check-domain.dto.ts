import { IsString, Matches } from 'class-validator';

export class CheckDomainDto {
  @IsString()
  @Matches(/^(?!-)([a-z0-9-]{1,63}\.)+[a-z]{2,}$/i, { message: 'Неверное доменное имя' })
  name: string;
}
