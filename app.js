const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');
require('dotenv').config();
const app = express();
const port = 3000;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
});

app.use(express.json());
app.use(express.static('static'));

async function initializeDatabase() {
    // initialize the database with the required tables.
    const initNotes = `
        CREATE TABLE IF NOT EXISTS notes (
            id SERIAL PRIMARY KEY,
            author TEXT NOT NULL,
            title TEXT,
            text TEXT,
            description TEXT,
            tags TEXT[],
            visibility_mode TEXT,
            duration_mode TEXT,
            specific_users_tags TEXT[],
            view_value INT,
            date_value DATE,
            time_value TIME,
            date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            date_deleted TIMESTAMP
        );`;

    const initUsers = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            bio TEXT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            account_date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            account_date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            account_date_deleted TIMESTAMP
        );`;
    try {
        await pool.query(initNotes);
        console.log("Table 'notes' created successfully");
        await pool.query(initUsers);
        console.log("Table 'users' created successfully");
    } catch (err) {
        console.error("Error creating table: ", err);
    }
}

function verifyToken(req, res, next) {
    // 401, 403, 500
    // check if the client has a valid token.
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // if there is no token, return an error message.
    if (!token) return res.status(401).send({ error: "No token provided" });
   
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send({ error: "Invalid token" });
        // return the user id and email. This can be used to fetch the user data from the database.
        req.user = user;
        next();
    });
}

async function getUserData(email, username=email) {
    // query the database to get the user data.
    // the query could either be by email or username.
    const result = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $2", [email, username]);
    return result.rows[0];
}

// Page routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/static/html/index.html");
});

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/static/html/login.html");
});

app.get("/register", (req, res) => {
    res.sendFile(__dirname + "/static/html/register.html");
});

app.get("/create", (req, res) => {
    res.sendFile(__dirname + "/static/html/create.html");
});

app.get("/modify", (req, res) => {
    res.sendFile(__dirname + "/static/html/modify.html");
});

app.get("/account", (req, res) => {
    res.sendFile(__dirname + "/static/html/account.html");
});

// Auth routes
app.get("/auth/account", verifyToken, async (req, res) => {
    // 200, 500 (401, 403)
    // get the user data from the database using the email from the token.
    const { email } = req.user;
    try {
        const result = await getUserData(email);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching user data: ", err);
        res.status(500).send({ error: `Error fetching user data: ${err}` });
    }
});

app.post("/auth/login", async (req, res) => {
    // 200, 401, 422, 500
    // authenticate the user login and return a token on success.
    const { usernameEmail, password } = req.body;
    try {
        const result = await getUserData(usernameEmail);
        // check if the username or email exists and the password is correct.
        if (!result) return res.status(422).send({ error: "Username or email not found" });
        if (result.password !== password) return res.status(401).send({ error: "Invalid password" });

        // generate a token with the user id and email.
        const token = jwt.sign({ id: result.id, email: result.email }, process.env.JWT_SECRET, { expiresIn: "30d" });

        // update last login timestamp
        await pool.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE email = $1", [result.email]);
        console.log(`User logged in successfully with email: ${result.email}`);

        res.status(200).json({ token });
    } catch (err) {
        console.error("Error logging in: ", err);
        res.status(500).send({ error: `Error logging in: ${err}` });
    }
});

app.post("/auth/register", async (req, res) => {
    // 200, 422, 500
    const { username, email, password } = req.body;
    try {
        const user = await getUserData(email);
        if (user) {
            if (user.username === username) return res.status(422).send({ error: "Username already exists" });
            if (user.email === email) return res.status(422).send({ error: "Email already exists" });
        }
        // insert the new user data into the database
        const queryText = `INSERT INTO users (username, bio, email, password) VALUES ($1, $2, $3, $4) RETURNING id;`;
        const values = [username, "", email, password];
        const result = await pool.query(queryText, values);
        console.log(`User registered successfully with id: ${result.rows[0].id}`);
        res.status(200).send("User registered successfully");
    } catch (err) {
        console.error("Error registering user: ", err);
        res.status(500).send({ error: `Error registering user: ${err}` });
    }
});










app.use((req, res) => res.status(404).send('Page Not Found'));
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    initializeDatabase();
});