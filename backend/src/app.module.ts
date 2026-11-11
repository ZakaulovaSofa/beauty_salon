import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { MastersModule } from './masters/masters.module.js';
import { ServicesModule } from './services/services.module.js';
import { AppointmentsModule } from './appointments/appointments.module.js';
import { SchedulesModule } from './schedules/schedules.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'mysql',
        host: config.getOrThrow<string>('DB_HOST'),
        port: Number(config.getOrThrow<string>('DB_PORT')),
        username: config.getOrThrow<string>('DB_USERNAME'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),

        autoLoadModels: true,
        synchronize: false,
        logging: false,
      }),
    }),

    AuthModule,
    UsersModule,
    MastersModule,
    ServicesModule,
    AppointmentsModule,
    SchedulesModule,
  ],
})
export class AppModule {}