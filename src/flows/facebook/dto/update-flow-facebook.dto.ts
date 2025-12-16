import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, Matches, ValidateNested } from 'class-validator';

export class FacebookPixelItemDto {
  @ApiProperty({
    description: 'Facebook Pixel ID',
    example: '857141767042815'
  })
  @IsString()
  @Matches(/^\d+$/, { message: 'Pixel ID must contain only digits' })
  pixelId: string;

  @ApiProperty({
    description: 'Facebook Conversion API Token',
    example: 'EAAUYh7jeTWwBQLZC...'
  })
  @IsString()
  token: string;
}

export class UpdateFlowFacebookDto {
  @ApiProperty({
    description: 'List of Facebook Pixels with tokens',
    type: [FacebookPixelItemDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FacebookPixelItemDto)
  facebook: FacebookPixelItemDto[];
}
