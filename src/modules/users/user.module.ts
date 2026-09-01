import { Module } from '@nestjs/common'
import { UserController } from './user.controller';
import { UsersService } from './user.service';
import { LimitsModule } from '../limits/limits.module';
import { TransfersModule } from '../transfers/transfers.module';

@Module({
    imports: [LimitsModule, TransfersModule],
    controllers: [UserController],
    providers: [UsersService],
    exports: [UsersService]
})

export class UsersModule {}