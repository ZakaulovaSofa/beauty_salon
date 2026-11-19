
import { ApiProperty } from '@nestjs/swagger';

import { Status } from '../../common/enums/status.enum.js';

export class ServiceResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'Женская стрижка' })
    name!: string;

    @ApiProperty({
        example: 'Стрижка и укладка',
        nullable: true,
    })
    description!: string | null;

    @ApiProperty({ example: 1500 })
    price!: number;

    @ApiProperty({ example: 60 })
    duration_minutes!: number;

    @ApiProperty({
        enum: Status,
        example: Status.ACTIVE,
    })
    status!: Status;
}
