import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  Query,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { ORDER_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { CreateOrderDto, OrderPaginationDto, StatusDto } from './dto';
import { OrderTCP } from 'src/common/enum/order-tcp.enum';
import { firstValueFrom } from 'rxjs';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(ORDER_SERVICE) private readonly ordersClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersClient.send({ cmd: OrderTCP.CREATE }, createOrderDto);
  }

  @Get()
  async findAll(@Query() orderPaginationDto: OrderPaginationDto) {
    try {
      const orders = await firstValueFrom(
        this.ordersClient.send({ cmd: OrderTCP.FIND_ALL }, orderPaginationDto),
      );

      return orders;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('/id/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const order = await firstValueFrom(
        this.ordersClient.send({ cmd: OrderTCP.FIND_ONE }, { id }),
      );

      return order;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get(':status')
  async finAllByStatus(
    @Param() statusDto: StatusDto,
    @Query() paginationDto: PaginationDto,
  ) {
    try {
      const orders = await firstValueFrom(
        this.ordersClient.send(
          { cmd: OrderTCP.FIND_ALL },
          {
            ...paginationDto,
            status: statusDto.status,
          },
        ),
      );

      return orders;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Patch(':id')
  async changeOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: StatusDto,
  ) {
    try {
      const order = await firstValueFrom(
        this.ordersClient.send(
          { cmd: OrderTCP.UPDATE_STATUS },
          { id, status: statusDto.status },
        ),
      );

      return order;
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
