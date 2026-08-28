import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  Min,
  Length,
  Max,
  IsOptional,
} from 'class-validator';

export class UpdateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  @ApiPropertyOptional()
  rating?: number;

  @IsString()
  @Length(4, 100)
  @IsOptional()
  @ApiPropertyOptional()
  comment?: string;
}
