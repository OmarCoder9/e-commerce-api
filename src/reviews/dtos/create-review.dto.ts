import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, Min, Length, Max } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  @ApiProperty()
  rating!: number;

  @IsString()
  @IsNotEmpty()
  @Length(4, 100)
  @ApiProperty()
  comment!: string;
}
