import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class CreateUserDto {
    @ApiProperty({
        example: '+639171234567',
        description: 'PH mobile number'
    })
    @IsString()
    @Matches(/^(?:\+639\d{9}|09\d{9})$/, {
    message: 'Mobile number must be +639xxxxxxxxx or 09xxxxxxxxx'
    })
    mobile!: string

    @ApiProperty({
        example: 'John Mark Marquez'
    })
    @IsString()
    @MinLength(1)
    @MaxLength(90)
    displayName!: string

    @ApiPropertyOptional({
        example: '3000.00',
        description: 'Philippine Peso, maximum of two decimal places. If not filled, will default to 0.00' 
    })
    @IsOptional()
    @Matches(/^\d{1,12}(?:\.\d{1,2})?$/, {
        message: 'Initial balance must be a PHP amount with up to 2 decimal places.'
    })
    initialBalance?: string
}