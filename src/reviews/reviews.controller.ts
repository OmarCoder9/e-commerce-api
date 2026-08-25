import { Controller, Get, Post, Body } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dtos/create-review.dto';

@Controller('/api/reviews')
export class ReviewsController {
  constructor(private readonly reviewService: ReviewsService){}

  
  @Post()
  public createReview(@Body() body: CreateReviewDto) {
    return this.reviewService.createReview(body)
  }
  @Get()
  public getAllReview() {
    return this.reviewService.getAllReview();
  }
}
