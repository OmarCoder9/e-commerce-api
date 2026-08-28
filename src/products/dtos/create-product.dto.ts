import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, Min, Length } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 100)
  @ApiProperty()
  title!: string;

  @IsString()
  @ApiProperty()
  description!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @ApiProperty()
  price!: number;
}
