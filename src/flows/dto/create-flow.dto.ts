import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFlowDto {
  @ApiProperty({ example: '8d4227ec-4c18-4d88-81c2-f3b0fc0000fa' })
  userId: string;

  @ApiProperty({ example: 'Трафик на Aviator Казахстан' })
  name: string;

  @ApiProperty({ example: '3c71dc29-c1df-4aa4-93ae-e40b3d3b0000' })
  domainId: string;

  @ApiProperty({ example: '7a5913a3-b17f-4db1-a814-5cb672300000' })
  landingId: string;

  @ApiPropertyOptional({ type: [String], example: ['123456789012345'] })
  facebookPixelIds?: string[];

  @ApiPropertyOptional({ type: [String], example: ['EAAJdJS0sdfklsdf23'] })
  facebookApiTokens?: string[];

  @ApiPropertyOptional({ example: true })
  cloakingEnabled?: boolean;

  @ApiPropertyOptional({
    example: {
      countries: ['KZ', 'RU'],
      devices: ['mobile'],
      languages: ['ru']
    }
  })
  cloakSettings?: Record<string, any>;

  @ApiPropertyOptional({ example: 'a6b0fd2c-7bb4-4df4-8ed4-befb0000b7b2' })
  abTestGroupId?: string;

  @ApiPropertyOptional({ example: 'ru' })
  lang?: string;

  @ApiPropertyOptional({ example: 'Roboto' })
  font?: string;

  @ApiPropertyOptional({ example: '400' })
  fontWeight?: string;

  @ApiPropertyOptional({ example: 'https://example.com/redirect' })
  redirectUrl?: string;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;

  @ApiPropertyOptional({
    example: {
      sub1: 'utm_source',
      sub2: 'utm_campaign'
    }
  })
  macros?: Record<string, string>;

  @ApiPropertyOptional({ example: 'client-uuid-123' })
  clientId?: string;

  @ApiPropertyOptional({ example: 'default' })
  macrosType?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://backup1.com', 'https://backup2.com']
  })
  trafficbackUrls?: string[];

  @ApiPropertyOptional({
    example: {
      geo: ['US'],
      device: ['desktop']
    }
  })
  trafficbackRules?: Record<string, any>;

  @ApiPropertyOptional({ example: 'https://prelander.example.com' })
  prelanderUrl?: string;

  @ApiPropertyOptional({ example: 'https://landing.example.com' })
  finalLandingUrl?: string;

  @ApiPropertyOptional({ example: 3 })
  switchDelay?: number;
}
