
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ServicesController } from './services.controller.js';
import { ServicesService } from './services.service.js';
import { Service } from './models/service.model.js';

import { Master } from '../masters/models/master.model.js';
import { MasterService } from '../masters/models/master-service.model.js';
import { User } from '../users/models/user.model.js';

@Module({
    imports: [
        SequelizeModule.forFeature([
            Service,
            Master,
            MasterService,
            User,
        ]),
    ],
    controllers: [ServicesController],
    providers: [ServicesService],
    exports: [ServicesService],
})
export class ServicesModule {}
