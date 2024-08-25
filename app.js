const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();
const app = express();
const port =  3000;

async function initializeDatabase() {
    const initialQUery = `
        CREATE TABLE IF NOT EXISTS textkeep (
            id SERIAL PRIMARY KEY,
            title TEXT,
            text TEXT,
            description TEXT,
            tags TEXT[],
            visibility_mode TEXT,
            duration_mode TEXT,
            specific_users_tags TEXT[],
            view_value INT,
            date_value DATE,
            time_value TIME
        );`;
    try {
        await pool.query(initialQUery);
        console.log("Table 'textkeep' created successfully");
    } catch (err) {
        console.error("Error creating table 'textkeep': ", err);
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

app.post("/submit", async (req, res) => {
    const formData = req.body;
    const textSizeKiB = Buffer.byteLength(formData.text || "", "utf-8") / 1024;
    console.log(`Text size: ${textSizeKiB.toFixed(3)} KiB`);

    const queryText = `
        INSERT INTO textkeep (title, text, description, tags, visibility_mode, duration_mode, specific_users_tags, view_value, date_value, time_value)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id;`;
    const values = [
        formData.title,
        formData.text,
        formData.description,
        formData.tags,
        formData.visibilityMode,
        formData.durationMode,
        formData.specificUsersTags,
        formData.viewValue,
        formData.dateValue,
        formData.timeValue
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

app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});

initializeDatabase();