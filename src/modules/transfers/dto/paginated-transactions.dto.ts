import { ApiProperty } from "@nestjs/swagger";
import { TransferResponseDto } from "./transfer-response.dto";
import { TransactionStatus } from "@prisma/client";

export class TransactionItemDto extends TransferResponseDto {
    @ApiProperty({ enum: ['SENT', 'RECEIVED']})
    transactionItem!: 'SENT' | 'RECEIVED'
}

export class PaginatedTransactionsDto {
    @ApiProperty({ type: TransactionItemDto, isArray: true })
    items!: TransactionItemDto[]

    @ApiProperty({ example: 1})
    page!: number;

    @ApiProperty({ example: 20})
    pageSize!: number;

    @ApiProperty({ example: 20})
    total!: number
}