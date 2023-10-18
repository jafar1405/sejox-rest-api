//const http = require("http");
const express = require("express");
const fs = require("fs");
// Require the bcrypt module
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// secret key
const secret = "12345";

// Generate a salt
const salt = bcrypt.genSaltSync(10);

const app = express();

// For parsing application/json
app.use(express.json());

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// A function that creates a token and sends it to the response
function createTokenAndSendResponse(user, res) {
  // Create a payload object
  const payload = {
    id: user.id,
    username: user.username,
  };

  // Sign the token
  const token = jwt.sign(payload, secret, { expiresIn: "30m" });

  // Send the token
  res.json({ token: token });
}

app.get("/", function (req, res) {
  res.send("hello world");
});

app.post("/signup", function (req, res) {
  fs.readFile("db.json", function (err, data) {
    const { username, password } = req.body;
    const users = JSON.parse(data).users;
    const sortedUsersById = users.sort((a, b) => a.id - b.id);
    const autoIncrementId = sortedUsersById[sortedUsersById.length - 1].id + 1;

    // Hash the password with the salt
    const hashPassword = bcrypt.hashSync(password, salt);

    const newUser = { id: autoIncrementId, username, password: hashPassword };
    users.push(newUser);
    fs.writeFile(
      "db.json",
      JSON.stringify({ ...JSON.parse(data), users: users }),
      function (err) {
        if (err) throw err;
        // res.json(newUser);
        createTokenAndSendResponse(newUser, res);
      }
    );
  });
});

app.post("/login", function (req, res) {
  fs.readFile("db.json", function (err, data) {
    const { username, password } = req.body;
    const users = JSON.parse(data).users;

    const foundUser = JSON.parse(data).users.find(
      (user) => user.username === username
    );
    if (foundUser) {
      // Compare the password "password" with the hash
      const result = bcrypt.compareSync(password, foundUser.password);
      if (result) {
        createTokenAndSendResponse(foundUser, res);
      } else {
        res.json({ msg: "password not matching" });
      }
    } else {
      res.json("No user found");
    }
  });
});

app.get("/users", function (req, res) {
  const token = req.headers["x-access-token"];
  if (token) {
    // Validate the token
    try {
      // Verify the token and get the payload
      const payload = jwt.verify(token, secret);

      fs.readFile("db.json", function (err, data) {
        res.json(JSON.parse(data).users);
      });
    } catch (err) {
      // Handle the error
      console.error(err);
      res.json({ msg: "pleae provide valid token" });
    }
  } else {
    res.json({ msg: "you are not authorized" });
  }
});

// app.post("/users", function (req, res) {
//   fs.readFile("db.json", function (err, data) {
//     const users = JSON.parse(data).users;
//     const sortedUsersById = users.sort((a, b) => a.id - b.id);
//     const autoIncrementId = sortedUsersById[sortedUsersById.length - 1].id + 1;
//     const newUser = { id: autoIncrementId, ...req.body };
//     users.push(newUser);
//     fs.writeFile(
//       "db.json",
//       JSON.stringify({ ...JSON.parse(data), users: users }),
//       function (err) {
//         if (err) throw err;
//         res.json(newUser);
//       }
//     );
//   });
// });

app.get("/users/:id", function (req, res) {
  fs.readFile("db.json", function (err, data) {
    const foundUser = JSON.parse(data).users.find(
      (user) => user.id === parseInt(req.params.id)
    );
    if (foundUser) {
      res.json(foundUser);
    } else {
      res.json("No user found");
    }
  });
});

app.listen(3004, function () {
  console.log("server running on port 3004");
});

// http
//   .createServer(function (req, res) {
//     fs.readFile("db.json", "utf-8", function (err, data) {
//       if (err) throw err;
//       console.log("req.url>>>", req.url);
//       const id = req.url.split("/")[2];
//       if (req.url.includes("/users/") && id) {
//         const users = JSON.parse(data).users;
//         const user = users.find((user) => user.id === parseInt(id));
//         res.end(JSON.stringify(user));
//       } else if (req.url === "/users") {
//         console.log(" JSON.parse(data)>>>", JSON.parse(data));
//         const users = JSON.parse(data).users;
//         res.end(JSON.stringify(users));
//       } else {
//         res.end("404 not found");
//       }
//     });
//   })
//   .listen(3004, function () {
//     console.log("server is running on port 3004");
//   });

// fs.readFile("db.json", "utf-8", function (err, data) {
//   if (err) throw err;
//   console.log("data>>>", data);
// });

// const data = {
//   users: [{ id: 101, name: "sejox" }],
// };

// fs.writeFile("db.json", JSON.stringify(data), function (err) {
//   if (err) throw err;
//   console.log("Saved");
// });
