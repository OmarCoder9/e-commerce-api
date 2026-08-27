import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dtos/create-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { JwtPayloadType } from '../utils/types';
import { UserRoles } from '../utils/userRoles';
export interface IReview {
  id: number;
  rate: number;
  message: string;
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  public async create(
    productId: number,
    userId: number,
    createReviewDto: CreateReviewDto,
  ) {
    const product = await this.productsService.getSingleProduct(productId);
    const user = await this.usersService.getCurrentUser(userId);

    const review = this.reviewRepository.create({
      ...createReviewDto,
      user,
      product,
    });
    const res = await this.reviewRepository.save(review);
    return {
      id: res.id,
      comment: res.comment,
      rating: res.rating,
      createdAt: res.createdAt,
      userId,
      productId,
    };
  }

  public async getAll() {
    return this.reviewRepository.find({ order: { createdAt: 'DESC' } });
  }

  public async update(
    reviewId: number,
    userId: number,
    updateReviewDto: UpdateReviewDto,
  ) {
    const review = await this.getReview(reviewId);
    if(review.user.id !== userId)
      throw new ForbiddenException("access denied, you can't edit this review")
    review.rating = updateReviewDto.rating ?? review.rating
    review.comment = updateReviewDto.comment ?? review.comment

    return this.reviewRepository.save(review)
  }

  public async delete(reviewId:number, payload:JwtPayloadType){
    const review = await this.getReview(reviewId)
    if(review.user.id === payload.id || payload.role === UserRoles.ADMIN){
      await this.reviewRepository.remove(review)
      return {message: "Review has been deleted"}
    }

    throw new ForbiddenException("You're not allowed")
  }

  private async getReview(id: number) {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review Not Found');
    return review;
  }
}
