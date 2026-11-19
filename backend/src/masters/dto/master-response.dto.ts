
import { ApiProperty } from '@nestjs/swagger';

import { Status } from '../../common/enums/status.enum.js';

export class MasterResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'Мария' })
    first_name!: string;

    @ApiProperty({ example: 'Петрова' })
    last_name!: string;

    @ApiProperty({ example: 5, minimum: 0 })
    experience!: number;

    @ApiProperty({
        example: 'Парикмахер-стилист',
        nullable: true,
    })
    description!: string | null;

    @ApiProperty({
        example: null,
        nullable: true,
    })
    photo_url!: string | null;

    @ApiProperty({
        enum: Status,
        example: Status.ACTIVE,
    })
    status!: Status;
}
