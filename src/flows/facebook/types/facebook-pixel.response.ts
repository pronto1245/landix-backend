import { ApiProperty } from '@nestjs/swagger';

export class FacebookPixelResponse {
  @ApiProperty({
    example: '857141767042815'
  })
  pixelId: string;

  @ApiProperty({
    example: 'EAAU********ZDZD',
    description: 'Masked token'
  })
  tokenMasked: string;

  @ApiProperty({
    example: true
  })
  isActive: boolean;
}
