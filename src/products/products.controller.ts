import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { PaginationDto, ProductTCP } from 'src/common';
import { PRODUCT_SERVICE } from 'src/config';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productsClient: ClientProxy,
  ) {}

  @Post()
  createProduct(@Body() createProduct: CreateProductDto) {
    return this.productsClient.send({ cmd: ProductTCP.CREATE }, createProduct);
  }

  @Get()
  findAllProducts(@Query() paginationDto: PaginationDto) {
    return this.productsClient.send(
      { cmd: ProductTCP.FIND_ALL },
      paginationDto,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await firstValueFrom(
        this.productsClient.send({ cmd: ProductTCP.FIND_ONE }, { id }),
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Patch(':id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    try {
      return await firstValueFrom(
        this.productsClient.send(
          { cmd: ProductTCP.UPDATE },
          { id, ...updateProductDto },
        ),
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.productsClient.send({ cmd: ProductTCP.DELETE }, { id }).pipe(
      catchError((err) => {
        throw new RpcException(err);
      }),
    );
  }
}
