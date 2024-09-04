// controllers/pageController.js
const path = require('path');

exports.sendPage = (page) => (req, res) => {
    const filePath = path.join(__dirname, '/../static/html', page);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('File sending error:', err);
            res.status(err.status).end();
        }
    });
};
