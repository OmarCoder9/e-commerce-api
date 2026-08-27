import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Product } from './product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly userService: UsersService,
  ) {}
  public async create(dto: CreateProductDto, userId: number) {
    const user = await this.userService.getCurrentUser(userId);
    const newProduct = this.productRepository.create({
      ...dto,
      title: dto.title.toLowerCase(),
      user,
    });
    return this.productRepository.save(newProduct);
  }

  public async getAll(
    title?: string,
    minPrice?: string,
    maxPrice?: string,
  ) {
    const where: FindOptionsWhere<Product> = {};

    if (title) {
      where.title = Like(`%${title.toLowerCase()}%`);
    }

    const minimum = minPrice === undefined ? undefined : Number(minPrice);
    const maximum = maxPrice === undefined ? undefined : Number(maxPrice);

    if (minimum !== undefined && Number.isNaN(minimum)) {
      throw new BadRequestException('minPrice must be a number');
    }
    if (maximum !== undefined && Number.isNaN(maximum)) {
      throw new BadRequestException('maxPrice must be a number');
    }

    if (minimum !== undefined && maximum !== undefined) {
      where.price = Between(minimum, maximum);
    } else if (minimum !== undefined) {
      where.price = MoreThanOrEqual(minimum);
    } else if (maximum !== undefined) {
      where.price = LessThanOrEqual(maximum);
    }

    return this.productRepository.find({ where });
  }

  public async getSingleProduct(productID: number) {
    const product = await this.productRepository.findOne({
      where: { id: productID },
    });
    if (!product) {
      throw new NotFoundException();
    }
    return product;
  }

  public async update(
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

  public async delete(productID: number) {
    const res = await this.productRepository.delete({ id: productID });
    if (!res.affected) throw new NotFoundException();
    return { status: 'success', data: { affectedProducts: res.affected } };
  }
}
