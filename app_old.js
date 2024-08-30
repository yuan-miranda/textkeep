



app.post("/submit", async (req, res) => {
    // outdated code, needs to be updated.
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

// app.get("/auth/user", verifyToken, (req, res) => {
//     // outdated code, moved to /auth/account API endpoint.
//     res.status(200).json(req.user);
// });







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