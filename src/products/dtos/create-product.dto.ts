import { IsNumber, IsString, IsNotEmpty, Min, Length } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 100)
  title!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price!: number;
}
