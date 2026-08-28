import { ProductsService } from './products.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { Roles } from '../users/decorators/user-role.decorator';
import { UserRoles } from '../utils/userRoles';
import { AuthRolesGuard } from '../users/guards/auth-roles.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import type { JwtPayloadType } from '../utils/types';
import { ApiQuery, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@Controller('/api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthRolesGuard)
  @Roles(UserRoles.ADMIN)
  @ApiSecurity("bearer")
  public createProduct(
    @Body() body: CreateProductDto,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    return this.productsService.create(body, payload.id);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'products fetched successfully' })
  @ApiOperation({ summary: 'Get All Products' })
  @ApiQuery({
    name: 'title',
    required: false,
    type: 'string',
    description: 'Search based on product title',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: 'string',
    description: 'minimum price',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: 'string',
    description: 'maximum price',
  })
  public getAllProducts(
    @Query('title') title?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.productsService.getAll(title, minPrice, maxPrice);
  }

  @Get('/:productID')
  public getSingleProduct(@Param('productID', ParseIntPipe) productID: number) {
    return this.productsService.getSingleProduct(productID);
  }

  @Patch('/:productID')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRoles.ADMIN)
  @ApiSecurity("bearer")
  public updateProduct(
    @Param('productID', ParseIntPipe) productID: number,
    @Body() body: UpdateProductDto,
  ) {
    return this.productsService.update(productID, body);
  }

  @Delete('/:productID')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRoles.ADMIN)
  @ApiSecurity("bearer")
  public deleteProduct(@Param('productID', ParseIntPipe) productID: number) {
    return this.productsService.delete(productID);
  }
}
