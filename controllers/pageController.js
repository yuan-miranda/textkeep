// controllers/pageController.js

/**
 * Indirect way to send a page to the user.
 * @param {Object} page 
 */
exports.sendPage = (page) => (req, res) => {
    res.sendFile(page, { root: "static/html" });
};