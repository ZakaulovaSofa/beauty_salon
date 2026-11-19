
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEnum } from 'class-validator';

import { Status } from '../../common/enums/status.enum.js';

export class SetMasterServiceStatusDto {
    @ApiProperty({
        enum: Status,
        example: Status.ACTIVE,
        description: 'Статус связи мастера с услугой',
    })
    @IsDefined()
    @IsEnum(Status)
    status!: Status;
}
