# Inventory Ledger API

## Install

npm install

## Run Server

npm run dev

## Run Tests

npm test

## Database Linking

Database file:
inventory.db

Connection setup:
app/database.js

Flow:
Client -> Express Route -> Joi Validation -> SQLite -> Response

## Frontend UI

A browser UI is now available from the same server.

- Start the server with `npm run dev`
- Open `http://localhost:3000`
- Add entries, filter by category, view the weekly summary, and delete entries from the interface.
