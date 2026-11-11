import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { MastersController } from './masters.controller.js';
import { MastersService } from './masters.service.js';

import { Master } from './models/master.model.js';
import { MasterService } from './models/master-service.model.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Master,
      MasterService,
    ]),
  ],
  controllers: [MastersController],
  providers: [MastersService],
  exports: [MastersService],
})
export class MastersModule {}