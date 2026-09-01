import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post
} from '@nestjs/common'

import { 
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiTags,
    ApiUnprocessableEntityResponse
} from '@nestjs/swagger'

import { CreateTransferDto } from './dto/create-transfer.dto'
import { TransferResponseDto } from './dto/transfer-response.dto'
import { TransfersService } from './transfers.service'

@ApiTags('transfers')
@Controller('transfers')
export class TransfersController {
    constructor (private readonly transfersService: TransfersService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'This is the API for sending money via users'
    })
    @ApiCreatedResponse({ type: TransferResponseDto})
    @ApiBadRequestResponse({ description: 'Validation error or self-transfer'})
    @ApiNotFoundResponse({ description: 'Sender or recipient does not exist'})
    @ApiConflictResponse({ description: 'Insufficient funds'})
    @ApiUnprocessableEntityResponse({ description: 'Daily or monthly cap exceeded.'})
    send(@Body() dto: CreateTransferDto): Promise<TransferResponseDto> {
        return this.transfersService.send(dto)
    }
}