import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript';

import { Status } from '../../common/enums/status.enum.js';

@Table({
  tableName: 'service',
  timestamps: false,
})
export class Service extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  })
  declare price: number;

  @Column({
    field: 'duration_minutes',
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  })
  declare durationMinutes: number;

  @Column({
    type: DataType.ENUM(...Object.values(Status)),
    allowNull: false,
    defaultValue: Status.ACTIVE,
  })
  declare status: Status;
}