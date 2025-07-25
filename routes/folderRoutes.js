const { Router } = require("express");
const {
  createFolder,
  updateFolder,
  deleteFolder,
} = require("../controllers/folderController");

const folderRoutes = Router();

// Create a new folder
folderRoutes.post("folder/create", createFolder);
// Update a folder by folderId
folderRoutes.put("/folders/:folderId", updateFolder);
// delete a folder by folderId
folderRoutes.delete("/folders/:folderId", deleteFolder);

module.exports = { folderRoutes };
