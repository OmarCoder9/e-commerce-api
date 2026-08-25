import { Injectable } from "@nestjs/common";
import { CreateReviewDto } from "./dtos/create-review.dto";
export interface IReview {
  id: number;
  rate: number;
  message: string;
}

@Injectable()
export class ReviewsService{
    private reviews: IReview[] = [
        { id: 1, rate: 3, message: 'Good' },
        { id: 2, rate: 5, message: 'Perfect' },
        { id: 3, rate: 4.5, message: 'Unique' },
      ];
    public createReview({rate, message}: CreateReviewDto) {
        const newReview:IReview = {
            id: this.reviews.length + 1,
            rate,
            message
          }
          this.reviews.push(newReview);
          return newReview;
      }
      
      public getAllReview() {
        return this.reviews;
      }
}