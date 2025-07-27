const { Router } = require("express");
const {
  createFolder,
  updateFolder,
  deleteFolder,
  uploadFile,
  updateFileDescription,
  deleteFile,
  getAllFolders,
  getFilesInFolder,
  getSortedFilesInFolder,
  getFilesByType,
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
// Update file description
folderRoutes.put("/folders/:folderId/files/:fileId", updateFileDescription);
// Delete file of a specific folder
folderRoutes.delete("/folders/:folderId/files/:fileId", deleteFile);
// Get All Folders
folderRoutes.get("/folders", getAllFolders);
// Get Files in a Folder
folderRoutes.get("/folders/:folderId/files", getFilesInFolder);
// Sort Files by Size or Recency
folderRoutes.get("/folders/:folderId/filesBySort", getSortedFilesInFolder);
// Get Files by Type Across Folders
folderRoutes.get("/files", getFilesByType);

module.exports = { folderRoutes };
