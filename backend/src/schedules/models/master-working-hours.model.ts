import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { Master } from '../../masters/models/master.model.js';

@Table({
  tableName: 'master_working_hours',
  timestamps: false,
})
export class MasterWorkingHours extends Model {
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

  @Column({
    field: 'day_of_week',
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 7,
    },
  })
  declare dayOfWeek: number;

  @Column({
    field: 'start_time',
    type: DataType.TIME,
    allowNull: false,
  })
  declare startTime: string;

  @Column({
    field: 'end_time',
    type: DataType.TIME,
    allowNull: false,
  })
  declare endTime: string;
}