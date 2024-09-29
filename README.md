## Textkeep (Simple Copy Paste Text Storage Service Webpage)
A simple text storage website for storing plain text over the Internet.

> [app.js](https://github.com/yuan-miranda/textkeep/blob/main/app.js) source code of the backend.<br>
> [textkeep.ddns.net](http://textkeep.ddns.net) website URL.<br>

## Installation Setup
**Note: You must have `Git`, `Node.js`, `npm`, and `PostgreSQL` installed prior to this setup**.<br>
1. Clone the repository on your machine:
```
git clone https://github.com/yuan-miranda/textkeep.git
```
2. Download the following modules by running the command below inside the `textkeep` directory:
```
npm install
```
or specifically install required packages:
```
npm install express cookie-parser dotenv express-session pg connect-pg-simple jsonwebtoken bcrypt nodemailer @sendgrid/mail node-cron
```
This will install the following modules:
```
@sendgrid/mail
bcrypt
connect-pg-simple
cookie-parser
dotenv
express
express-session
jsonwebtoken
node-cron
nodemailer
pg
```
3. Create a `.env` file inside the `textkeep` directory with the following values.
```
# .env contents
DB_USER=YOUR_DATABASE_USERNAME
DB_HOST=YOUR_DATABASE_HOST
DB_NAME=YOUR_DATABASE_NAME
DB_PASSWORD=YOUR_DATABASE_PASSWORD
JWT_SECRET=YOUR_JWT_SECRET_STR
SESSION_SECRET=YOUR_SESSION_SECRET_STR
EMAIL_ADDRESS=YOUR_EMAIL_ADDRESS
SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY
```
4. To run the page, execute the command inside the `textkeep` directory.
```
node app.js
```
