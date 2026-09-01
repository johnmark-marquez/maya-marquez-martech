import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class TransferResponseDto {
    @ApiProperty({ example: 'abcd1234-abcd-efgh-efgh-efgh22222' })
    id!: string

    @ApiProperty({ example: '11111111-1111-4111-8111-111111111111' })
    senderId!: string

    @ApiProperty({ example: '22222222-2222-4222-8222-222222222222' })
    recipientId!: string

    @ApiProperty({ example: '500.00'})
    amount!: string

    @ApiProperty({ example: 'COMPLETED '})
    status!: string

    @ApiPropertyOptional({ nullable: true, example: 'For KKB' })
    note!: string | null

    @ApiProperty()
    createdAt: Date
}