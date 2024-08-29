const express = require("express");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require("dotenv").config();
const app = express();
const port =  3000;

async function initializeDatabase() {
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

app.use(express.json());
app.use(express.static("static"));

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432
});

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

app.post("/submit", async (req, res) => {
    const formData = req.body;
    const textSizeKiB = Buffer.byteLength(formData.text || "", "utf-8") / 1024;
    console.log(`Text size: ${textSizeKiB.toFixed(3)} KiB`);

    const queryText = `
        INSERT INTO notes (author, title, text, description, tags, visibility_mode, duration_mode, specific_users_tags, view_value, date_value, time_value, date_created, date_updated, date_deleted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id;`;
    const values = [
        formData.author,
        formData.title,
        formData.text,
        formData.description,
        formData.tags,
        formData.visibilityMode,
        formData.durationMode,
        formData.specificUsersTags,
        formData.viewValue,
        formData.dateValue,
        formData.timeValue,
        formData.dateCreated,
        formData.dateUpdated,
        formData.dateDeleted
    ];
    try {
        const result = await pool.query(queryText, values);
        console.log(`Data inserted successfully with id: ${result.rows[0].id}`);
        res.json({ id: result.rows[0].id, ...formData });
    } catch (err) {
        console.error("Error inserting data: ", err);
        res.status(500).json({ error: "Database insert failed" });
    }
});

function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).send("Unauthorized: No token provided");
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send("Unauthorized: Invalid token");
        req.user = user;
        next();
    });
}

app.get("/account", (req, res) => {
    res.sendFile(__dirname + "/static/html/account.html");
});

app.get("/auth/user", verifyToken, (req, res) => {
    res.status(200).json(req.user);
});

app.get("/auth/account", verifyToken, async (req, res) => {
    const { email } = req.user;
    try {
        const result = await getUserData(email);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching user data: ", err);
        res.status(500).send("An error occurred. Please try again later.");
    }
});

async function getUserData(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
}

app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await getUserData(email);
        if (!result) return res.status(422).send("Email not found");
        if (result.password !== password) return res.status(401).send("Invalid password");
        const token = jwt.sign({ id: result.id, email: result.email }, process.env.JWT_SECRET, { expiresIn: "30d" });
        res.status(200).json({ token });
    } catch (err) {
        console.error("Error logging in: ", err);
        res.status(500).send("An error occurred. Please try again later.");
    }
});

app.post("/auth/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const queryText = `
            INSERT INTO users (username, bio, email, password)
            VALUES ($1, $2, $3, $4) RETURNING id;`;
        const values = [username, "", email, password];
        const result = await pool.query(queryText, values);
        console.log(`User registered successfully with id: ${result.rows[0].id}`);
        res.status(200).send("User registered successfully");
    } catch (err) {
        console.error("Error registering user: ", err);
        res.status(500).send("An error occurred. Please try again later.");
    }
});

app.post("/auth/password-reset", async (req, res) => {
    // Handle password reset logic
});

app.post("/auth/delete", async (req, res) => {
    // Handle account deletion logic
});

app.post("/auth/update", async (req, res) => {
    // Handle account update logic
});

app.post("/auth/verify", async (req, res) => {
    // Handle account verification logic
});

app.post("/auth/logout", async (req, res) => {
    // Handle logout logic
});

app.post("/auth/guest", async (req, res) => {
    // Handle guest login logic
});















// API endpoints (security related category)
app.get("/auth/settings", verifyToken, (req, res) => {
    // ...
});
// app.get("/auth/user", verifyToken, (req, res) => {
//     // this one is verified, so it will only need the email,
//     // the issue will be for the guest accounts
//     // TODO: add a logic for guest accounts
//     const { email, password } = req.body;
//     try {
//         const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        
//     }
// });
app.get("/auth/verify", verifyToken, (req, res) => {
    res.status(200).json(req.user);
});
// API endpoints (data related category)
// API endpoints (account related category)
app.get("/settings", (req, res) => {
    // this will query the server to get user configuration data an display it
    // /auth/settings
    res.sendFile(__dirname + "/static/html/settings.html");
});
app.get("/account", (req, res) => {
    // after loading the page, it will query the server to get user data and display it
    // /auth/user
    res.sendFile(__dirname + "/static/html/account.html");
});
app.get("/register", (req, res) => {
    // after registration, it will redirect to login page 
    res.sendFile(__dirname + "/static/html/register.html");
});
app.get("/login", (req, res) => {
    // after login, it will redirect to "/" page
    res.sendFile(__dirname + "/static/html/login.html");
});
app.get("/logout", (req, res) => {
    // there function for this, it will be handled via /auth/logout API endpoint instead
    // /auth/logout
});

// API endpoints (admin related category)
// API endpoints (miscellaneous category)
app.get("/", (req, res) => {
    // default route which has the note creation page
    res.sendFile(__dirname + "/static/html/index.html");
});
app.get("/browse", (req, res) => {
    // brose public notes page
    res.sendFile(__dirname + "/static/html/browse.html");
});
app.get("/search", (req, res) => {
    // after clicking search button, this page will be displayed with search results
    res.sendFile(__dirname + "/static/html/search.html");
});
app.get("/about", (req, res) => {
    // about page
    res.sendFile(__dirname + "/static/html/about.html");
});
























app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});

initializeDatabase();