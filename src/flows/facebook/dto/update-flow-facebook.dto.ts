import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, Length, Matches, ValidateNested } from 'class-validator';

export class FacebookPixelItemDto {
  @ApiProperty({
    description: 'Facebook Pixel ID',
    example: '857141767042815',
    minLength: 15,
    maxLength: 20
  })
  @IsString()
  @Matches(/^\d+$/, { message: 'Pixel ID must contain only digits' })
  @Length(15, 20)
  pixelId: string;

  @ApiProperty({
    description: 'Facebook Conversion API Token',
    example: 'EAAUYh7jeTWwBQLZC...',
    minLength: 20,
    maxLength: 500
  })
  @IsString()
  @Length(20, 500)
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
