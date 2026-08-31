import { Prisma, PrismaClient, TransactionStatus, UserStatus } from '@prisma/client';
import { uuid } from 'uuidv4';
import { faker } from '@faker-js/faker';

const DAILY_LIMIT = '50000.00';
const MONTHLY_LIMIT = '500000.00';

const seedObject = {
    policyCode: "SEND_MONEY",
    john: uuid(),
    mark: uuid(),
    juan: uuid(),
    marco: uuid(),
    transferFromJohnToMark: uuid(),
    transferFromMarcoToMark: uuid(),
}

faker.seed(123); // Seed the random number generator for reproducibility

// Random balance generator for users between min and max values
const phpBalance = (min: number, max: number): string => {
    return faker.finance.amount({ min, max, dec: 2 });
}

// Use Manila timezone for consistent date and time values
// Add offset for Manila timezone (UTC+8) to the current date and time
const MANILA_OFFSET = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

function startOfDayInManila(date: Date): Date {
    const manilaDate = new Date(date.getTime() + MANILA_OFFSET);
    return new Date(manilaDate.getTime() - MANILA_OFFSET);
}

function startOfMonthInManila(date: Date): Date {
    const manilaDate = new Date(date.getTime() + MANILA_OFFSET);
    const startOfMonth = new Date(manilaDate.getFullYear(), manilaDate.getMonth(), 1);
    return new Date(startOfMonth.getTime() - MANILA_OFFSET);
}

const prisma = new PrismaClient();

const upsertUser = async (params: {
    id: string;
    mobile: string;
    displayName: string;
    balance: Prisma.Decimal;
    dailyUsed: Prisma.Decimal;
    monthlyUsed: Prisma.Decimal;
    dailyPeriodStart: Date;
    monthlyPeriodStart: Date;
}) => {
    const { id, mobile, displayName, balance, dailyUsed, monthlyUsed, dailyPeriodStart, monthlyPeriodStart } = params;

    await prisma.user.upsert({
        where: { id },
        create: {
            id,
            status: UserStatus.ACTIVE,
        },
        update: {
            status: UserStatus.ACTIVE,
        },
    });

    await prisma.identity.upsert({
        where: { userId: id },
        create: {
            userId: id,
            mobile,
            displayName,
        },
        update: {
            mobile,
            displayName,
        },
    });

    await prisma.wallet.upsert({
        where: { userId: id },
        create: {
            userId: id,
            balance,
        },
        update: {
            balance,
        },
    });

    await prisma.limitUsage.upsert({
        where: { userId: id },
        create: {
            userId: id,
            dailyUsed,
            monthlyUsed,
            dailyPeriodStart,
            monthlyPeriodStart,
        },
        update: {
            dailyUsed,
            monthlyUsed,
            dailyPeriodStart,
            monthlyPeriodStart,
        },
    });
};

async function main(): Promise<void> {
    const now = new Date();
    const todayStart = startOfDayInManila(now);
    const monthStart = startOfMonthInManila(now);

    console.log(`Seeding data with the following IDs: ${JSON.stringify(seedObject, null, 2)}`);

    // Add the lmit policy for sending money if it doesn't exist
    await prisma.limitPolicy.upsert({
        where: { code: seedObject.policyCode },
        create: {
            code: seedObject.policyCode,
            dailyCap: DAILY_LIMIT,
            monthlyCap: MONTHLY_LIMIT,
        },
        update: {
            dailyCap: DAILY_LIMIT,
            monthlyCap: MONTHLY_LIMIT,
        },
    });

    // Creating a scenario where John will send money to Mark and Marco will send money to Mark as well. This will help us test the transfer functionality and the limit policies in place.
    const transactionRecords = [
        {
            id: seedObject.transferFromJohnToMark,
            senderId: seedObject.john,
            recipientId: seedObject.mark,
            amount: new Prisma.Decimal(phpBalance(1000, 5000)),
            createdAt: new Date(),
            status: TransactionStatus.COMPLETED,
        },
        {
            id: seedObject.transferFromMarcoToMark,
            senderId: seedObject.marco,
            recipientId: seedObject.mark,
            amount: new Prisma.Decimal(phpBalance(10000, 15000)),
            createdAt: new Date(),
            status: TransactionStatus.COMPLETED,
        },
    ];


    // Will create 4 users with random balances between 10,000 and 50,000 PHP

    // Creating account balances where John and Marco will send money to Mark.
    // Subtracting the sent amounts from the base balance of John and Marco to get their current balance after sending money.
    // Adding the received amounts to Mark's base balance to get his current balance after receiving money from John and Marco.

    const johnBase = new Prisma.Decimal(phpBalance(10000, 50000));
    const johnSent = new Prisma.Decimal(transactionRecords[0].amount.toString());
    const johnBalance = johnBase.sub(johnSent);

    const marcoBase = new Prisma.Decimal(phpBalance(30000, 50000));
    const marcoSent = new Prisma.Decimal(transactionRecords[1].amount.toString());
    const marcoBalance = marcoBase.sub(marcoSent);

    const markBase = new Prisma.Decimal(phpBalance(25000, 50000));
    const markReceived = new Prisma.Decimal(transactionRecords[0].amount.toString()).add(new Prisma.Decimal(transactionRecords[1].amount.toString()));
    const markBalance = markBase.add(markReceived);

    // Creating user records with the calculated balances and other necessary details
    const userRecords = [
        {
            id: seedObject.john,
            mobile: '639170000001',
            displayName: 'John Doe',
            balance: johnBalance,
            dailyUsed: new Prisma.Decimal(transactionRecords[0].amount),
            monthlyUsed: new Prisma.Decimal('0.00'),
            dailyPeriodStart: todayStart,
            monthlyPeriodStart: monthStart,
        },
        {
            id: seedObject.mark,
            mobile: '639170000002',
            displayName: 'Mark Doe',
            balance: markBalance,
            dailyUsed: new Prisma.Decimal('0.00'),
            monthlyUsed: new Prisma.Decimal('0.00'),
            dailyPeriodStart: todayStart,
            monthlyPeriodStart: monthStart,
        },
        {
            id: seedObject.juan,
            mobile: '639170000003',
            displayName: 'Juan Doe',
            balance: new Prisma.Decimal(phpBalance(16000, 50000)),
            dailyUsed: new Prisma.Decimal('0.00'),
            monthlyUsed: new Prisma.Decimal('0.00'),
            dailyPeriodStart: todayStart,
            monthlyPeriodStart: monthStart,
        },
        {
            id: seedObject.marco,
            mobile: '639170000004',
            displayName: 'Marco Doe',
            balance: marcoBalance,
            dailyUsed: new Prisma.Decimal(transactionRecords[1].amount),
            monthlyUsed: new Prisma.Decimal('0.00'),
            dailyPeriodStart: todayStart,
            monthlyPeriodStart: monthStart,
        },
    ];

    await prisma.limitPolicy.upsert({
        where: { code: seedObject.policyCode },
        create: {
            code: seedObject.policyCode,
            dailyCap: DAILY_LIMIT,
            monthlyCap: MONTHLY_LIMIT,
        },
        update: {
            dailyCap: DAILY_LIMIT,
            monthlyCap: MONTHLY_LIMIT,
        },
    });



    for (const user of userRecords) {
        await upsertUser(user);
        console.log(`User ${user.displayName} with mobile ${user.mobile} and balance ${user.balance} has been upserted.`);
    }



    for (const transfer of transactionRecords) {
        await prisma.transaction.upsert({
            where: { id: transfer.id },
            create: {
                id: transfer.id,
                senderId: transfer.senderId,
                recipientId: transfer.recipientId,
                amount: transfer.amount,
                createdAt: transfer.createdAt,
                status: transfer.status,
            },
            update: {
                senderId: transfer.senderId,
                recipientId: transfer.recipientId,
                amount: transfer.amount,
                createdAt: transfer.createdAt,
                status: transfer.status,
            },
        });
    }

    console.log(
        `Seed execution completed. Users and limit policy have been upserted successfully.`
    )

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });