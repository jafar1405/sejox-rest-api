const http = require("http");
const fs = require("fs");

http
  .createServer(function (req, res) {
    fs.readFile("db.json", "utf-8", function (err, data) {
      if (err) throw err;
      console.log("req.url>>>", req.url);
      const id = req.url.split("/")[2];
      if (req.url.includes("/users/") && id) {
        const users = JSON.parse(data).users;
        const user = users.find((user) => user.id === parseInt(id));
        res.end(JSON.stringify(user));
      } else if (req.url === "/users") {
        console.log(" JSON.parse(data)>>>", JSON.parse(data));
        const users = JSON.parse(data).users;
        res.end(JSON.stringify(users));
      } else {
        res.end("404 not found");
      }
    });
  })
  .listen(3004, function () {
    console.log("server is running on port 3004");
  });

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
