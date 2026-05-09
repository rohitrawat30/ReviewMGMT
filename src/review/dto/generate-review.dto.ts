import { IsInt, IsArray, ArrayNotEmpty, IsString, Min, Max } from 'class-validator';

export class GenerateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  keywords: string[];
}
