const { Router } = require("express");
const { createFolder } = require("../controllers/folderController");

const folderRoutes = Router();

// Create a new folder
folderRoutes.post("/create", createFolder);

module.exports = { folderRoutes };
