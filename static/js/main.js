// // backend code
// // function verifyToken(req, res, next) {
// //     const token = req.headers["authorization"];
// //     if (!token) return res.status(401).send("Unauthorized: No token provided");
// //     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
// //         if (err) return res.status(403).send("Unauthorized: Invalid token");
// //         req.user = user;
// //         next();
// //     });
// // }

// // app.get("/account", verifyToken, (req, res) => {
// //     res.sendFile(__dirname + "/static/html/account.html");
// // });

// // app.get("/auth/user", verifyToken, (req, res) => {
// //     res.status(200).json(req.user);
// // });

// // app.post("/auth/login", async (req, res) => {
// //     const { email, password } = req.body;
// //     try {
// //         const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
// //         if (result.rows.length === 0) {
// //             res.status(422).send("Email not found");
// //             return;
// //         }
// //         if (result.rows[0].password !== password) {
// //             res.status(401).send("Invalid password");
// //             return;
// //         }
// //         const token = jwt.sign({ id: result.rows[0].id, email: result.rows[0].email
// //         }, process.env.JWT_SECRET,
// //         { expiresIn: "30d" });
// //         res.status(200).json({ token });
// //     } catch (err) {
// //         console.error("Error logging in: ", err);
// //         res.status(500).send("An error occurred. Please try again later.");
// //     }
// // });







// function handleProfile() {
    
// }

// function profileIconListener() {
//     document.getElementById("profile-icon").addEventListener("click", () => handleProfile());
// }

// // function handleProfile

// // initiprofile
// // check token
// // use token to get user


// async function initProfile() {
//     const token = localStorage.getItem("token");
//     if (token) {
//         try {
//             const response = await fetch("/auth/verify", {
//                 method: "GET",
//                 headers: {
//                     "Authorization": `Bearer ${token}`,
//                     "Content-Type": "application/json"
//                 }
//             });
//             const data = await response.json();
//             console.log(data);
            
//         } catch (err) {
//             alert("An error occurred. Please try again later.");
//         }
//     }


//     const profileImage = document.getElementById("profile-image");
//     const profileImageSrc = localStorage.getItem("profileImageSrc");
//     if (profileImageSrc) profileImage.src = profileImageSrc;
//     else profileImage.src = "../media/profiles/defaultprofile.png";
//     profileIconListener();
// }


// document.addEventListener("DOMContentLoaded", () => {
//     initProfile();
// });