import { ApiProperty } from '@nestjs/swagger';

export class UpdateLandingDto {
  @ApiProperty({
    type: String,
    description: 'ID лендинга',
    example: 'abce1234-5678-90ff-1122-334455'
  })
  landingId: string;
}
