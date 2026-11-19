
import { ApiProperty } from '@nestjs/swagger';

import { Status } from '../../common/enums/status.enum.js';

export class MasterServiceLinkResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 1 })
    master_id!: number;

    @ApiProperty({ example: 1 })
    service_id!: number;

    @ApiProperty({
        enum: Status,
        example: Status.ACTIVE,
    })
    status!: Status;
}
