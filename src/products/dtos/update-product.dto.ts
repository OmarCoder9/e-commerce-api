import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  Min,
  Length,
  IsOptional,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 100)
  @IsOptional()
  @ApiPropertyOptional()
  title?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional()
  price?: number;
}
