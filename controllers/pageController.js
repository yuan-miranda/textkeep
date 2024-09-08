// controllers/pageController.js
exports.sendPage = (page) => (req, res) => {
    res.sendFile(page, { root: "static/html" });
};