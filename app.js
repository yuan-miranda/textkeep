const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const sessionMiddleware = require("./middlewares/sessionMiddleware");
const pageRoutes = require("./routes/pageRoutes");
const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const { initializeDatabase } = require("./utils/dbUtils");
const { persistentEmailVerificationReroute } = require("./middlewares/authMiddleware");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static("static"));
app.use(session(sessionMiddleware));

app.use(persistentEmailVerificationReroute);
app.use("/", pageRoutes);
app.use("/auth", authRoutes);
app.use("/session", sessionRoutes);

app.use((req, res) => res.status(404).send("Page Not Found"));
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send("Internal Server Error");
// });
app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    await initializeDatabase();
    require("./scheduled-tasks/scheduledTasks");
});