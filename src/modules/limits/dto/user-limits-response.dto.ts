import { ApiProperty } from "@nestjs/swagger";

export class LimitWindowDto {
    @ApiProperty({ example: '50000.00'})
    cap!: string

    @ApiProperty({ example: '1200.50'})
    used!: string

    @ApiProperty({
        example: '35000.12',
        description: 'Remaining amount left to be used.'
    })
    remaining!: string

    @ApiProperty({
        example: '2026-09-01T00:00:00.000+08:00',
        description: 'Limit window start in Asia/Manila'
    })
    periodStart!: string

    
    @ApiProperty({
        example: '2026-09-02T00:00:00.000+08:00',
        description: 'Limit window end in Asia/Manila'
    })
    periodEnd!: string
}

export class UserLimitsResponseDto {
    @ApiProperty()
    userId!: string

    @ApiProperty({ example: 'SEND_MONEY'})
    policy!: string

    @ApiProperty({ type: LimitWindowDto })
    daily!: LimitWindowDto

    @ApiProperty({ type: LimitWindowDto })
    monthly!: LimitWindowDto
}