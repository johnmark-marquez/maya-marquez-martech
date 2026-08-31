import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
    @ApiProperty()
    id!: string

    @ApiProperty({ example: 'ACTIVE'})
    status!: string

    @ApiProperty()
    displayName!: string

    @ApiProperty({
        example: '09171234567'
    })
    mobile!: string

    @ApiProperty({ example: '50000.00'})
    balance!: string
    
    @ApiProperty()
    createdAt!: Date;
}