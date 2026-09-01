import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    MaxLength,
} from 'class-validator'

export class CreateTransferDto {
    @ApiProperty({ example: '11111111-1111-4111-8111-111111111111' })
    @IsUUID()
    senderId!: string

    @ApiProperty({ example: '22222222-2222-4222-8222-222222222222' })
    @IsUUID()
    recipientId!: string

    @ApiProperty({
        example: '500.00',
        description: 'PHP Pesos, up to 2 decimal places in place. Should not be equal to zero.'
    })
    @Matches(/^\d{1,12}(\.\d{1,2})?$/, {
        message: 'Amount must be a PHP amount with up to 2 decimal places'
    })
    amount!: string

    @ApiPropertyOptional({ example: 'For KKB'})
    @IsOptional()
    @IsString()
    @MaxLength(140)
    note?: string
}