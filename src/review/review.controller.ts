import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ReviewService, SubmitReviewResult } from './review.service';
import { GenerateReviewDto } from './dto/generate-review.dto';
import { SubmitReviewDto } from './dto/submit-review.dto';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // POST /api/review/generate
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  generateReview(@Body() dto: GenerateReviewDto): Promise<{ review: string }> {
    return this.reviewService.generateReview(dto);
  }

  // POST /api/review/submit
  @Post('submit')
  @HttpCode(HttpStatus.OK)
  submitReview(@Body() dto: SubmitReviewDto): Promise<SubmitReviewResult> {
    return this.reviewService.submitReview(dto);
  }
}
