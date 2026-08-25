import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { InjectRepository } from '@nestjs/typeorm';

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
  ) {}
  public async createProduct(dto: CreateProductDto) {
    const newProduct = this.productRepository.create(dto);
    await this.productRepository.save(newProduct);
    return { status: 'Success', data: newProduct };
  }

  public async getAllProducts() {
    const products = await this.productRepository.find();
    return { status: 'success', data: products };
  }

  public async getSingleProduct(productID: number) {
    const product = await this.productRepository.findOne({
      where: { id: productID },
    });
    if (!product) {
      throw new NotFoundException();
    }
    return { status: 'success', data: product };
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
