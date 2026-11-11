import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { User } from '../../users/models/user.model.js';
import { Status } from '../../common/enums/status.enum.js';

@Table({
  tableName: 'masters',
  timestamps: false,
})
export class Master extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    field: 'user_id',
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
  })
  declare userId: number;

  @BelongsTo(() => User, {
    foreignKey: 'userId',
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  declare user: User;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  })
  declare experience: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

  @Column({
    field: 'photo_url',
    type: DataType.STRING(2048),
    allowNull: true,
  })
  declare photoUrl: string | null;

  @Column({
    type: DataType.ENUM(...Object.values(Status)),
    allowNull: false,
    defaultValue: Status.ACTIVE,
  })
  declare status: Status;
}