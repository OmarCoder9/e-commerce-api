import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dtos/create-product.dto';

type ProductTestType = { id: number; title: string; price: number };
type Options = {
  where: { title?: string; minPrice?: number; maxPrice?: number };
};
type FindOneParam = { where: { id: number } };

describe('ProductsService', () => {
  let productsService: ProductsService;
  let productsRepository: Repository<Product>;
  const REPOSITORY_TOKEN = getRepositoryToken(Product);
  const createProductDto: CreateProductDto = {
    title: 'test',
    description: 'Testt',
    price: 200,
  };

  let products: ProductTestType[];

  beforeEach(async () => {
    products = [
      { id: 1, title: 'p1', price: 10 },
      { id: 2, title: 'p2', price: 20 },
      { id: 3, title: 'p3', price: 30 },
      { id: 4, title: 'p4', price: 30 },
    ];
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: UsersService,
          useValue: {
            getCurrentUser: jest.fn((userId: number) =>
              Promise.resolve({ id: userId }),
            ),
          },
        },
        {
          provide: REPOSITORY_TOKEN,
          useValue: {
            create: jest.fn((dto: CreateProductDto) => dto),
            save: jest.fn((dto: CreateProductDto) =>
              Promise.resolve({ ...dto, id: 1 }),
            ),
            find: jest.fn((options?: Options) => {
              if (options?.where.title)
                return Promise.resolve([products[0], products[1]]);
              return Promise.resolve(products);
            }),
            findOne: jest.fn((param: FindOneParam) =>
              Promise.resolve(products.find((p) => p.id === param.where.id)),
            ),
            remove: jest.fn((product: Product) => {
              const index = products.indexOf(product);
              if (index !== -1)
                return Promise.resolve(products.splice(index, 1));
            }),
          },
        },
      ],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);
    productsRepository = module.get<Repository<Product>>(REPOSITORY_TOKEN);
  });

  it('should product service be defined', () => {
    expect(productsService).toBeDefined();
  });
  it('should product repository be defined', () => {
    expect(productsRepository).toBeDefined();
  });

  describe('createProduct()', () => {
    it("Should call 'create' method in product repository", async () => {
      await productsService.create(createProductDto, 1);
      expect(productsRepository.create).toHaveBeenCalled();
      expect(productsRepository.create).toHaveBeenCalledTimes(1);
    });
    it("Should call 'save' method in product repository", async () => {
      await productsService.create(createProductDto, 1);
      expect(productsRepository.save).toHaveBeenCalled();
      expect(productsRepository.save).toHaveBeenCalledTimes(1);
    });
    it('Should create a new product', async () => {
      const res = await productsService.create(createProductDto, 1);
      expect(res).toBeDefined();
      expect(res.title).toBe('test');
      expect(res.id).toBe(1);
    });
  });

  describe('getAllProducts()', () => {
    it("Should call 'find' method in product repository", async () => {
      await productsService.getAll();
      expect(productsRepository.find).toHaveBeenCalled();
      expect(productsRepository.find).toHaveBeenCalledTimes(1);
    });
    it('Should return 2 products if argument passed', async () => {
      const res = await productsService.getAll('book');
      expect(res).toHaveLength(2);
    });
    it('Should return all products if no argument passed', async () => {
      const res = await productsService.getAll();
      expect(res).toHaveLength(products.length);
      expect(res).toBe(products);
    });
  });

  describe('getSingleProduct()', () => {
    it("Should call 'findOne' method in product repository", async () => {
      await productsService.getSingleProduct(1);
      expect(productsRepository.findOne).toHaveBeenCalled();
      expect(productsRepository.findOne).toHaveBeenCalledTimes(1);
    });
    it('Should return a product with the given id', async () => {
      const res = await productsService.getSingleProduct(1);
      expect(res).toMatchObject(products[0]);
    });
    it('Should throw NotFoundException if product was not found', async () => {
      expect.assertions(1);
      try {
        await productsService.getSingleProduct(5000);
      } catch (error) {
        expect(error).toMatchObject({ message: 'Product Not Found' });
      }
    });
  });
  describe('update()', () => {
    const title = 'product updated';
    it("Should call 'save' method in product repository and update the product", async () => {
      const res = await productsService.update(1, { title });
      expect(productsRepository.save).toHaveBeenCalled();
      expect(productsRepository.save).toHaveBeenCalledTimes(1);
      expect(res.title).toBe(title);
    });
    it('should throw NotFoundException if product was not found', async () => {
      expect.assertions(1);
      try {
        await productsService.update(20, { title });
      } catch (error) {
        expect(error).toMatchObject({ message: 'Product Not Found' });
      }
    });
  });

  describe('delete()', () => {
    it("should call 'remove' method in products repository", async () => {
      await productsService.delete(1);
      expect(productsRepository.remove).toHaveBeenCalled();
      expect(productsRepository.remove).toHaveBeenCalledTimes(1);
    });

    it('should remove the product and return the sccess message', async () => {
      const result = await productsService.delete(1);
      expect(result).toMatchObject({ message: 'product deleted successfully' });
    });

    it('should throw NotFoundException if product was not found', async () => {
      expect.assertions(1);
      try {
        await productsService.delete(20);
      } catch (error) {
        expect(error).toMatchObject({ message: 'Product Not Found' });
      }
    });
  });
});
