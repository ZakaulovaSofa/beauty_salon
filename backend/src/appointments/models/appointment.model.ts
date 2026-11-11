import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { User } from '../../users/models/user.model.js';
import { MasterService } from '../../masters/models/master-service.model.js';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum.js';

@Table({
  tableName: 'appointment',
  timestamps: false,
})
export class Appointment extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    field: 'client_id',
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare clientId: number;

  @BelongsTo(() => User, {
    foreignKey: 'clientId',
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  declare client: User;

  @ForeignKey(() => MasterService)
  @Column({
    field: 'master_service_id',
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare masterServiceId: number;

  @BelongsTo(() => MasterService, {
    foreignKey: 'masterServiceId',
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  declare masterService: MasterService;

  @Column({
    field: 'start_time',
    type: DataType.DATE,
    allowNull: false,
  })
  declare startTime: Date;

  @Column({
    field: 'end_time',
    type: DataType.DATE,
    allowNull: false,
  })
  declare endTime: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  })
  declare price: number;

  @Column({
    type: DataType.ENUM(
      ...Object.values(AppointmentStatus),
    ),
    allowNull: false,
    defaultValue: AppointmentStatus.PLANNED,
  })
  declare status: AppointmentStatus;
}