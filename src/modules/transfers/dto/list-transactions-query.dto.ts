import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, Max, min, Min } from 'class-validator'

export class ListTransactionsQueryDto {
    @ApiPropertyOptional({ default: 1, minimum: 1})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number

    @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageSize?: number
}