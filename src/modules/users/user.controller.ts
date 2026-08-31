import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common'
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

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(private readonly usersService: UsersService) {}

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

}