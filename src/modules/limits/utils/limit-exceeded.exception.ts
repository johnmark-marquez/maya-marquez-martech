import { HttpException, HttpStatus } from "@nestjs/common";

export type LimitCap = 'DAILY' | 'MONTHLY'

export class LimitExceededException extends HttpException {
    constructor (cap: LimitCap, remaining: string) {
        const label = cap === 'DAILY' ? 'Daily' : 'Monthly'
        super(
            {
                statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                error: 'Request is unprocessable',
                message: `${label} send money limit exceeded`,
                cap,
                remaining
            },
            HttpStatus.UNPROCESSABLE_ENTITY
        )
    }
}