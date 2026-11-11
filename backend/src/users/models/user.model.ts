import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript';

import { Role } from '../../common/enums/role.enum.js';

@Table({
  tableName: 'users',
  timestamps: false,
})
export class User extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  declare login: string;

  @Column({
    field: 'password_hash',
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare passwordHash: string;

  @Column({
    field: 'first_name',
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare firstName: string;

  @Column({
    field: 'last_name',
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare lastName: string;

  @Column({
    type: DataType.ENUM(...Object.values(Role)),
    allowNull: false,
  })
  declare role: Role;
}