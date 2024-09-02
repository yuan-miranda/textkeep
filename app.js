const express = require('express');
const session = require('express-session');
const sessionMiddleware = require('./middleware/sessionMiddleware');
const pageRoutes = require('./routes/pageRoutes');
const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const { initializeDatabase } = require('./utils/dbUtils');
const { persistentEmailVerificationReroute } = require('./middlewares/authMiddleware');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('static'));
app.use(session(sessionMiddleware));

app.use(persistentEmailVerificationReroute);
app.use("/", pageRoutes);
app.use("/auth", authRoutes);
app.use("/session", sessionRoutes);

app.use((req, res) => res.status(404).send('Page Not Found'));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    initializeDatabase();
    require('./scheduled-tasks/scheduledTasks');
});