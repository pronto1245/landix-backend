import { IsInt, IsString, Max, Min } from 'class-validator';

export class PurchaseDomainDto {
  @IsString()
  domainName: string;

  @IsInt()
  @Min(1)
  @Max(3)
  years: number = 1;
}
