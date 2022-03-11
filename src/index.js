const express = require("express");
const app = express();

require("./db/mongoose");

const userRoute = require("../routers/user");
const taskRoute = require("../routers/task");
const port = process.env.PORT;

app.use(express.json());
app.use(userRoute);
app.use(taskRoute);

app.listen(port, (req, res) => {
  console.log("Server running on port " + port + "...");
});
