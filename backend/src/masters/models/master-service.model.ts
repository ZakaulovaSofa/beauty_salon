import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { Master } from './master.model.js';
import { Service } from '../../services/models/service.model.js';
import { Status } from '../../common/enums/status.enum.js';

@Table({
  tableName: 'master_service',
  timestamps: false,
  indexes: [
    {
      name: 'uq_master_service_pair',
      unique: true,
      fields: ['master_id', 'service_id'],
    },
  ],
})
export class MasterService extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  })
  declare id: number;

  @ForeignKey(() => Master)
  @Column({
    field: 'master_id',
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare masterId: number;

  @BelongsTo(() => Master, {
    foreignKey: 'masterId',
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  declare master: Master;

  @ForeignKey(() => Service)
  @Column({
    field: 'service_id',
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare serviceId: number;

  @BelongsTo(() => Service, {
    foreignKey: 'serviceId',
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  declare service: Service;

  @Column({
    type: DataType.ENUM(...Object.values(Status)),
    allowNull: false,
  })
  declare status: Status;
}