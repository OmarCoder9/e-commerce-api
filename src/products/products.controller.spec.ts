import { Test, TestingModule } from "@nestjs/testing";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { JwtPayloadType } from "../utils/types";
import { UserRoles } from "../utils/userRoles";
import { CreateProductDto } from "./dtos/create-product.dto";
import { NotFoundException } from "@nestjs/common";
import { UpdateProductDto } from "./dtos/update-product.dto";
type ProductTestType = { id: number, title: string, price: number };


describe('ProductsController', () => {
    let productsController: ProductsController;
    let productsService: ProductsService;
    const currentUser: JwtPayloadType = { id: 1, role: UserRoles.ADMIN };
    const createProductDto: CreateProductDto = {
        title: 'book',
        description: 'about this book',
        price: 10
    };

    let products: ProductTestType[];

    beforeEach(async () => {
        products = [
            { id: 1, title: 'book', price: 10 },
            { id: 2, title: 'laptop', price: 500 },
            { id: 3, title: 'carpet', price: 100 },
            { id: 4, title: 'chair', price: 20 },
        ]
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductsController],
            providers: [
                { provide: ConfigService, useValue: {} },
                { provide: UsersService, useValue: {} },
                { provide: JwtService, useValue: {} },
                {
                    provide: ProductsService,
                    useValue: {
                        create: jest.fn((dto: CreateProductDto, userId: number) => Promise.resolve({ ...dto, id: 1 })),
                        getAll: jest.fn((title?: string, minPrice?: number, maxPrice?: number) => {
                            if (title) return Promise.resolve(products.filter(p => p.title === title));
                            if (minPrice && maxPrice) return Promise.resolve(products.filter(p => p.price >= minPrice && p.price <= maxPrice));
                            return Promise.resolve(products);
                        }),
                        getSingleProduct: jest.fn((id: number) => {
                            const product = products.find(p => p.id === id);
                            if (!product) throw new NotFoundException('product not found');
                            return Promise.resolve(product);
                        }),
                        update: jest.fn((productId: number, dto: UpdateProductDto) => Promise.resolve({ ...dto, id: productId })),
                        delete: jest.fn((productId: number) => true)
                    }
                }
            ]
        }).compile();

        productsController = module.get<ProductsController>(ProductsController);
        productsService = module.get<ProductsService>(ProductsService);
    });

    it("should productsController be defined", () => {
        expect(productsController).toBeDefined();
    });

    it("should productsService be defined", () => {
        expect(productsService).toBeDefined();
    });

    // Create new product
    describe('createProduct()', () => {
        it("should call 'createProduct' method in productsService", async () => {
            await productsController.createProduct(createProductDto, currentUser);
            expect(productsService.create).toHaveBeenCalled();
            expect(productsService.create).toHaveBeenCalledTimes(1);
            expect(productsService.create).toHaveBeenCalledWith(createProductDto, currentUser.id);
        });

        it("should return new product with the givin data", async () => {
            const result = await productsController.createProduct(createProductDto, currentUser);
            expect(result).toMatchObject({...createProductDto, id:1});
            expect(result.id).toBe(1);
        });
    });

    // Get all products
    describe('getAllProducts()', () => {
        it("it should call 'getAll' method in productsService", async () => {
            await productsController.getAllProducts();
            expect(productsService.getAll).toHaveBeenCalled();
            expect(productsService.getAll).toHaveBeenCalledTimes(1);
        });

        it("it should return all products if no argument passed", async () => {
            const data = await productsController.getAllProducts();
            expect(data).toBe(products);
            expect(data).toHaveLength(4);
        });


        it("it should return products based on title", async () => {
            const data = await productsController.getAllProducts("book");
            expect(data[0]).toMatchObject({ title: 'book' });
            expect(data).toHaveLength(1);
        });


        it("it should return products based on minPrice & maxPrice", async () => {
            const data = await productsController.getAllProducts(undefined, "80", "900");
            expect(data).toHaveLength(2);
        });
    });

    // Get single product by id
    describe('getSingleProduct()', () => {
        it("should call 'getSingleProduct' method in productsService", async () => {
            await productsController.getSingleProduct(2);
            expect(productsService.getSingleProduct).toHaveBeenCalled();
            expect(productsService.getSingleProduct).toHaveBeenCalledTimes(1);
            expect(productsService.getSingleProduct).toHaveBeenCalledWith(2);
        });

        it("should return a product with the givin id", async () => {
            const product = await productsController.getSingleProduct(2);
            expect(product.id).toBe(2);
        });

        it("should throw NotFoundException if product was not found", async () => {
            expect.assertions(1);
            try {
                await productsController.getSingleProduct(20);
            } catch (error) {
                expect(error).toMatchObject({ message: 'product not found' })
            }
        })
    });

    // Update product
    describe('updateProduct()', () => {
        const title = 'product updated';

        it("should call 'update' method in productsService", async () => {
            await productsController.updateProduct(2, { title });
            expect(productsService.update).toHaveBeenCalled();
            expect(productsService.update).toHaveBeenCalledTimes(1);
            expect(productsService.update).toHaveBeenCalledWith(2, { title });
        });

        it("should return the updated product", async () => {
            const result = await productsController.updateProduct(2, { title });
            expect(result.title).toBe(title);
            expect(result.id).toBe(2);
        });
    });

    // Delete product
    describe('deleteProduct()', () => {
        it("should call 'delete' method in productsService", async () => {
            await productsController.deleteProduct(2);
            expect(productsService.delete).toHaveBeenCalled();
            expect(productsService.delete).toHaveBeenCalledTimes(1)
        });
    });
});