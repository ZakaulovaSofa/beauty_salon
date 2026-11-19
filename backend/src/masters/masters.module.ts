
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { MastersController } from './masters.controller.js';
import { MastersService } from './masters.service.js';

import { Master } from './models/master.model.js';
import { MasterService } from './models/master-service.model.js';

import { User } from '../users/models/user.model.js';
import { Service } from '../services/models/service.model.js';

@Module({
    imports: [
        SequelizeModule.forFeature([
            Master,
            MasterService,
            User,
            Service,
        ]),
    ],
    controllers: [MastersController],
    providers: [MastersService],
    exports: [MastersService],
})
export class MastersModule {}
