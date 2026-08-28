import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import type { JwtPayloadType } from '../utils/types';
import { AuthRolesGuard } from '../users/guards/auth-roles.guard';
import { UserRoles } from '../utils/userRoles';
import { Roles } from '../users/decorators/user-role.decorator';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { ApiSecurity } from '@nestjs/swagger';

@Controller('/api/reviews')
export class ReviewsController {
  constructor(private readonly reviewService: ReviewsService) {}

  @Post(':productId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @ApiSecurity("bearer")
  public createReview(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: CreateReviewDto,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    return this.reviewService.create(productId, payload.id, body);
  }

  @Get()
  @UseGuards(AuthRolesGuard)
  @Roles(UserRoles.ADMIN)
  @ApiSecurity("bearer")
  public getAllReviews(
    @Query("page") page?: number,
    @Query("limit") limit?:number
  ) {
    return this.reviewService.getAll(page, limit);
  }

  @Patch(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @ApiSecurity("bearer")
  public updateReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JwtPayloadType,
    @Body() body: UpdateReviewDto,
  ) {
    return this.reviewService.update(id, payload.id, body);
  }

  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @ApiSecurity("bearer")
  public deleteReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    return this.reviewService.delete(id, payload);
  }
}
