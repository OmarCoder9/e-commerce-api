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
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

@Controller('/api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  public createProduct(@Body() body: CreateProductDto) {
    return this.productsService.createProduct(body);
  }

  @Get()
  public getAllProducts() {
    return this.productsService.getAllProducts();
  }

  @Get('/:productID')
  public getSingleProduct(@Param('productID', ParseIntPipe) productID: number) {
    return this.productsService.getSingleProduct(productID);
  }

  @Patch('/:productID')
  public updateProduct(
    @Param('productID', ParseIntPipe) productID: number,
    @Body() body: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(productID, body);
  }

  @Delete('/:productID')
  public deleteProduct(@Param('productID', ParseIntPipe) productID: number) {
    return this.productsService.deleteProduct(productID);
  }
}
