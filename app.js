// app.js
const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const sessionMiddleware = require("./middlewares/sessionMiddleware");
const pageRoutes = require("./routes/pageRoutes");
const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const { initializeDatabase } = require("./utils/dbUtils");
const { guestAccess } = require("./middlewares/pageMiddleware");
const { persistentEmailVerificationReroute } = require("./middlewares/authMiddleware");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static("static"));
app.use(sessionMiddleware);

// thou shalt not pass
app.use(guestAccess);
app.use(persistentEmailVerificationReroute);

app.use("/", pageRoutes);
app.use("/auth", authRoutes);
app.use("/session", sessionRoutes);

// Handle 404
app.use((req, res) => res.status(404).send("Page Not Found"));

app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    await initializeDatabase();
    require("./scheduled-tasks/scheduledTasks");
});