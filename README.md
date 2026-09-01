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

- Create a file called `.env` using the sample environment variables from `.env.sample`
- Assuming Docker is already installed and setup correctly, run `docker compose up --build` for building the container first. This will ensure that the container is built, the seeded Users, Transactions, and Limits are transferred to the PostgreSQL database as well.
- Postgres is inside the Docker container, to access it you can execute the query `docker compose exec postgres psql -U postgres -d maya`

## Swagger URL

The Swagger URL can be access after running `docker compose up` on `http://localhost:3000/api/docs`

## Example requests for the main flows

- Assume that the sender has the id: `11111111-1111-4111-8111-111111111111`
- Assume that the recipient has the id: `22222222-2222-4222-8222-222222222222`
- Near monthly cap user: `33333333-3333-4333-8333-333333333333`

```bash
 # Create a user - this will create the user, save the user's mobile and display name in the Pii, and will create the user's wallet. To create a wallet with an initial amount, add some amount to the initialBalance variable.

 curl -X 'POST' \
 'http://localhost:3000/api/users' \
 -H 'accept: */*' \
 -H 'Content-Type: application/json' \
 -d '{
 "mobile": "+639171234567",
 "displayName": "Jay Marquez",
 "initialBalance": "2000"
 }'

 # Get user details
 curl -X 'GET' \
 'http://localhost:3000/api/users/11111111-1111-4111-8111-111111111111' \
 -H 'accept: application/json'

 # Get user limits (daily and monthly)
 curl -X 'GET' \
 'http://localhost:3000/api/users/11111111-1111-4111-8111-111111111111/limits' \
 -H 'accept: application/json'

 # Get user transaction history
 curl -X 'GET' \
 'http://localhost:3000/api/users/11111111-1111-4111-8111-111111111111/transactions?page=1&pageSize=20' \
 -H 'accept: application/json'

 # Happy path for sending money
 curl -X 'POST' \
 'http://localhost:3000/api/transfers' \
 -H 'accept: application/json' \
 -H 'Content-Type: application/json' \
 -d '{
 "senderId": "11111111-1111-4111-8111-111111111111",
 "recipientId": "22222222-2222-4222-8222-222222222222",
 "amount": "500.00",
 "note": "For KKB" }'

 # Over daily cap - Error 422 for exceeding the daily cap
 curl -X 'POST' \
 'http://localhost:3000/api/transfers' \
 -H 'accept: application/json' \
 -H 'Content-Type: application/json' \
 -d '{
 "senderId": "44444444-4444-4444-8444-444444444444",
 "recipientId": "22222222-2222-4222-8222-222222222222",
 "amount": "40000",
 "note": "For Daily"
}'


 # Over monthly cap - Error 422 for exceeding the monthly cap
   curl -X 'POST' \
 'http://localhost:3000/api/transfers' \
 -H 'accept: application/json' \
 -H 'Content-Type: application/json' \
 -d '{
 "senderId": "33333333-3333-4333-8333-333333333333",
 "recipientId": "22222222-2222-4222-8222-222222222222",
 "amount": "16000",
 "note": "For Monthly" }'
```


## Assumptions

- Not all users starts from the same balance (Test data)
- Recipient must already exist in the database
- Users can not send money > their remaining balance
- Users can transfer money without a minimum amount
- No authentication
- No duplicate mobile numbers
- Assumes mobile numbers are PH numbers
- Separate User schema and PII schema

Failure Cases:

| Status | When |
|---|---|
| *400* | Validation, amount <= 0 or the sender === recipient |
| *404* | Unknown sender or recipient |
| *409* | Insufficient funds or duplicate mobile number on create |
| *422* | Daily or monthly limit exceeded. 

## Before a production launch

- Add the authentication via AuthGuard
- Add envrionment variables to the Config Settings in AWS / Azure
- Check environment variables if they are correct
- Check migration (if there are updates to the schema)
- Check all commits are in the branch for merging to Production
- Check if build runs and if there are build errors and/or typescript errors
- Check if deployment needs to be on maintenance mode (application is down)
