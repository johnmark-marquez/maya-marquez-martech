-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "app";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "limits";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "pii";

-- CreateEnum
CREATE TYPE "app"."UserStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "app"."TransactionStatus" AS ENUM ('INITIAL', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "app"."users" (
    "id" UUID NOT NULL,
    "status" "app"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pii"."piis" (
    "user_id" UUID NOT NULL,
    "mobile" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,

    CONSTRAINT "piis_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "app"."wallets" (
    "user_id" UUID NOT NULL,
    "balance" DECIMAL(14,2) NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "app"."transactions" (
    "id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" "app"."TransactionStatus" NOT NULL DEFAULT 'INITIAL',
    "note" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "limits"."limit_policies" (
    "code" TEXT NOT NULL,
    "daily_cap" DECIMAL(14,2) NOT NULL,
    "monthly_cap" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "limit_policies_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "limits"."user_limit_usage" (
    "user_id" UUID NOT NULL,
    "daily_used" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "monthly_used" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "daily_period_start" TIMESTAMPTZ(3) NOT NULL,
    "monthly_period_start" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "user_limit_usage_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "piis_mobile_key" ON "pii"."piis"("mobile");

-- CreateIndex
CREATE INDEX "transactions_sender_id_created_at_idx" ON "app"."transactions"("sender_id", "created_at");

-- CreateIndex
CREATE INDEX "transactions_recipient_id_created_at_idx" ON "app"."transactions"("recipient_id", "created_at");

-- AddForeignKey
ALTER TABLE "pii"."piis" ADD CONSTRAINT "piis_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."transactions" ADD CONSTRAINT "transactions_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "app"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."transactions" ADD CONSTRAINT "transactions_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "app"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "limits"."user_limit_usage" ADD CONSTRAINT "user_limit_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
