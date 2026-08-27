import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';

export interface IProduct {
  id: number;
  title: string;
  price: number;
}

@Injectable()
export class ProductsService {
  private products: IProduct[] = [
    { id: 1, title: 'Phone', price: 50000 },
    { id: 2, title: 'Laptop', price: 25000 },
    { id: 3, title: 'Tablet', price: 5000 },
  ];
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly userService: UsersService,
  ) {}
  public async createProduct(dto: CreateProductDto, userId: number) {
    const user = await this.userService.getCurrentUser(userId);
    const newProduct = this.productRepository.create({
      ...dto,
      title: dto.title.toLowerCase(),
      user,
    });
    return this.productRepository.save(newProduct);
  }

  public async getAllProducts() {
    return this.productRepository.find({relations:{user:true, reviews:true}});
  }

  public async getSingleProduct(productID: number) {
    const product = await this.productRepository.findOne({
      where: { id: productID },
      relations:{user:true, reviews:true}
    });
    if (!product) {
      throw new NotFoundException();
    }
    return product
  }

  public async updateProduct(
    productID: number,
    updateProductDto: UpdateProductDto,
  ) {
    const res = await this.productRepository.update(
      { id: productID },
      updateProductDto,
    );
    if (!res.affected) throw new NotFoundException();

    return { status: 'success', data: { affectedProducts: res.affected } };
  }

  public async deleteProduct(productID: number) {
    const res = await this.productRepository.delete({ id: productID });
    if (!res.affected) throw new NotFoundException();
    return { status: 'success', data: { affectedProducts: res.affected } };
  }
}
