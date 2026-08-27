import { IsNumber, IsString, IsNotEmpty, Min, Length, Max, IsOptional } from 'class-validator';

export class UpdateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @Length(4, 100)
  @IsOptional()
  comment?: string;
}
