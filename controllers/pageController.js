// controllers/pageController.js
exports.sendPage = (page) => (req, res) => res.sendFile(__dirname + `/static/html/${page}`);