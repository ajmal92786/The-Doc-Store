const express = require("express");
const { folderRoutes } = require("./routes/folderRoutes");
const app = express();

app.use(express.json());
app.use("/folder", folderRoutes);

app.get("/", (req, res) => {
  return res.status(200).send("Welcome to document management system");
});

module.exports = { app };
