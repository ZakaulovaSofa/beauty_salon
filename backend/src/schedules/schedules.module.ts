import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { SchedulesController } from './schedules.controller.js';
import { SchedulesService } from './schedules.service.js';
import { MasterWorkingHours } from './models/master-working-hours.model.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      MasterWorkingHours,
    ]),
  ],
  controllers: [SchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}