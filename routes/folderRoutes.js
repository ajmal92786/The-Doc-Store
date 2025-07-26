const { Router } = require("express");
const {
  createFolder,
  updateFolder,
  deleteFolder,
  uploadFile,
} = require("../controllers/folderController");
const upload = require("../middlewares/multerConfig");

const folderRoutes = Router();

// Create a new folder
folderRoutes.post("/folder/create", createFolder);
// Update a folder by folderId
folderRoutes.put("/folders/:folderId", updateFolder);
// delete a folder by folderId
folderRoutes.delete("/folders/:folderId", deleteFolder);
// upload a file in a folder
folderRoutes.post(
  "/folders/:folderId/files",
  upload.single("file"),
  uploadFile
);

module.exports = { folderRoutes };
