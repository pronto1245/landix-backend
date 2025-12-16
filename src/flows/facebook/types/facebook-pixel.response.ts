import { ApiProperty } from '@nestjs/swagger';

export class FacebookPixelResponse {
  @ApiProperty({
    example: '857141767042815'
  })
  pixelId: string;

  @ApiProperty({
    example: 'EAAUYh7jeTWwBQLZDZD',
    description: 'Masked token'
  })
  token: string;

  @ApiProperty({
    example: true
  })
  isActive: boolean;
}
