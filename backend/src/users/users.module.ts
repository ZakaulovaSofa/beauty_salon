import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { User } from './models/user.model.js';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}