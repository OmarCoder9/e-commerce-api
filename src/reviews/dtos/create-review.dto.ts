import { IsNumber, IsString, IsNotEmpty, Min, Length, Max } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(5)
  rate!: number;

  @IsString()
  @IsNotEmpty()
  @Length(4, 100)
  message!: string;
}
