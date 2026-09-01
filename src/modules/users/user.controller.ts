import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common'
import {
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags
} from '@nestjs/swagger'
import { CreateUserDto } from './dto/create-user.dto'
import { UserResponseDto } from './dto/user-response.dto'
import { UsersService } from './user.service'
import { UserLimitsResponseDto } from '../limits/dto/user-limits-response.dto'
import { LimitsService } from '../limits/limits.service'
import { PaginatedTransactionsDto } from '../transfers/dto/paginated-transactions.dto'
import { ListTransactionsQueryDto } from '../transfers/dto/list-transactions-query.dto'
import { TransfersService } from '../transfers/transfers.service'

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(private readonly usersService: UsersService, private readonly limitsService: LimitsService, private readonly transfersService: TransfersService) {}

    @Post()
    @ApiOperation({
        summary: 'Creates a new user',
        description: 'Creates user details, pii, wallet and user usage limits.'
    })
    create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
        return this.usersService.create(dto)
    }

    @Get()
    @ApiOperation({
        summary: 'List users',
        description: 'Lists users details'
    })
    @ApiOkResponse({ type: UserResponseDto, isArray: true })
    findAll(): Promise<UserResponseDto[]> {
        return this.usersService.findAll()
    }

    @Get(':id')
    @ApiOperation({
        summary: 'List one user by their id'
    })
    @ApiOkResponse({ type: UserResponseDto, isArray: true })
    @ApiNotFoundResponse()
    findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto[]> {
        return this.usersService.findAll()
    }

    @Get(':id/limits')
    @ApiOperation({
        summary: 'Gets send money limits for a user',
    })
    @ApiOkResponse({ type: UserLimitsResponseDto })
    @ApiNotFoundResponse()
    getUserLimits(
        @Param('id', ParseUUIDPipe) id: string
    ): Promise<UserLimitsResponseDto> {
        return this.limitsService.getByUserId(id)
    }

    @Get(':id/transactions')
    @ApiOperation({
        summary: 'List sent and received transfers for a user'
    })
    @ApiOkResponse({ type: PaginatedTransactionsDto })
    @ApiNotFoundResponse()
    listTransactions(
        @Param('id', ParseUUIDPipe) id: string,
        @Query() query: ListTransactionsQueryDto
    ): Promise<PaginatedTransactionsDto> {
        return this.transfersService.listByUserId(
            id,
            query.page ?? 1,
            query.pageSize ?? 20
        )
    }
}