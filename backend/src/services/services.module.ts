import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ServicesController } from './services.controller.js';
import { ServicesService } from './services.service.js';

import { Service } from './models/service.model.js';

@Module({
  imports: [
    SequelizeModule.forFeature([Service]),
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}