const { Router } = require("express");
const {
  createFolder,
  updateFolder,
} = require("../controllers/folderController");

const folderRoutes = Router();

// Create a new folder
folderRoutes.post("folder/create", createFolder);
// Update a folder by folderId
folderRoutes.put("/folders/:folderId", updateFolder);

module.exports = { folderRoutes };
