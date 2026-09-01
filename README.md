
## Description

Send Money API technical exam for Maya Martech using NodeJS, NestJS, PostgreSQL and Prisma.

## Schemas and Models

``` 
  User
  Pii (Identity)
  Wallet
  Transactions
  LimitPolicy
  LimitUsage
```


## Prerequisites

 - NodeJS 22+
 - pnpm (if you want to run the API on localhost)
 - Docker / Docker Desktop

## How to install and run the project

 - Create a file called `.env`. // Edit this later
 - Assuming Docker is already installed and setup correctly, run `docker compose up --build` for building the container first. This will ensure that the container is built, the seeded Users, Transactions, and Limits are transferred to the PostgreSQL database as well.

## Swagger URL

The Swagger URL can be access after running `docker compose up` on `http://localhost:3000/api/docs`

## Sample requests for the main flows

## Assumptions
 - Not all users starts from the same balance (Test data)
 - Users can not send money > their remaining balance
 - Users can transfer money without a minimum amount
 - No duplicate mobile numbers
 - Assumes mobile numbers are PH numbers
 - Separate User schema and PII schema
 
## Before a production launch 
 - Check environment variables if they are correct
 - Check migration (if there are updates to the schema)
 - Check all commits are in the branch for merging to Production
 - Check if build runs and if there are build errors and/or typescript errors
 - Check if deployment needs to be on maintenance mode (application is down)