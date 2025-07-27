const File = require("../models/File");
const folderService = require("../services/folderService");
const fileService = require("../services/fileService");

const fs = require("fs");

const createFolder = async (req, res) => {
  try {
    const { name, type, maxFileLimit } = req.body;

    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ message: "Folder name is required and must be a string" });
    }
    if (!type || !["csv", "img", "pdf", "ppt"].includes(type)) {
      return res.status(422).json({ message: "Invalid folder type." });
    }
    if (!maxFileLimit || isNaN(maxFileLimit) || maxFileLimit <= 0) {
      return res
        .status(400)
        .json({ message: "maxFileLimit must be a positive integer." });
    }

    const folder = await folderService.createFolder({
      name,
      type,
      maxFileLimit,
    });
    return res.status(201).json({
      message: "Folder created successfully",
      folder,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

const updateFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { name, type, maxFileLimit } = req.body;

    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ message: "Folder name is required and must be a string" });
    }

    if (!type || !["csv", "img", "pdf", "ppt"].includes(type)) {
      return res.status(422).json({ message: "Invalid folder type." });
    }

    if (!maxFileLimit || isNaN(maxFileLimit) || maxFileLimit <= 0) {
      return res
        .status(400)
        .json({ message: "maxFileLimit must be a positive integer." });
    }

    const updatedFolder = await folderService.updateFolder(folderId, {
      name,
      type,
      maxFileLimit,
    });

    return res.status(200).json({
      message: "Folder updated successfully",
      folder: updatedFolder,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

const deleteFolder = async (req, res) => {
  try {
    const { folderId } = req.params;

    if (!folderId) {
      return res.status(400).json({ message: "Folder ID is required." });
    }

    await folderService.deleteFolder(folderId);

    return res
      .status(200)
      .json({ message: "Folder and associated files deleted successfully" });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

const uploadFile = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { description } = req.body;
    const { originalname, mimetype, size, path } = req.file;

    // Validate folder existence
    const folder = await folderService.getFolderByFolderId(folderId);
    if (!folder) {
      return res.status(404).json({ error: "Folder does not exist" });
    }

    // Check if file is  attached
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Normalize common extensions
    const extensionMap = {
      pptx: "ppt",
      ppt: "ppt",
      csv: "csv",
      pdf: "pdf",
      jpg: "img",
      jpeg: "img",
      png: "img",
    };

    const fileExt = originalname.split(".").pop().toLowerCase();
    const normalizedExt = extensionMap[fileExt];
    // Check file type matches folder type
    if (folder.type !== normalizedExt) {
      return res.status(400).json({
        error: `File type mismatch. Folder accepts .${folder.type} files only.`,
      });
    }

    // Check folder file limit
    const fileCount = await File.count({ where: { folderId } });
    if (fileCount >= folder.maxFileLimit) {
      return res
        .status(400)
        .json({ error: "Folder has reached maximum file limit" });
    }

    // Upload to cloudinary
    const result = await folderService.uploadToCloudinary(
      path,
      folder,
      originalname
    );
    console.log("Uploaded file to cloudinary: ", result);

    // Step 5: Delete local file
    fs.unlink(path, (err) => {
      if (err) console.error("Error deleting local file: ", err);
      else console.log("Local file deleted: ", path);
    });

    // Save file meta data to db
    const newFile = await folderService.saveFileInDB({
      name: originalname,
      type: mimetype,
      size,
      description,
      folderId,
      // cloudinaryUrl: result.secure_url,
    });

    return res.status(201).json({
      message: "File uploaded successfully",
      file: newFile,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

const updateFileDescription = async (req, res) => {
  try {
    const { folderId, fileId } = req.params;
    const { description } = req.body;

    // Validate input
    if (!description || typeof description !== "string") {
      return res.status(400).json({ message: "Valid description is required" });
    }

    const updatedFile = await fileService.updateFileDescription({
      folderId,
      fileId,
      description,
    });

    return res.status(200).json({
      message: "File description updated successfully",
      files: updatedFile,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { folderId, fileId } = req.params;

    const result = await fileService.deleteFileById(folderId, fileId);

    return res
      .status(200)
      .json({ message: "File deleted successfully.", fileId: result.fileId });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

const getAllFolders = async (req, res) => {
  try {
    const folders = await folderService.getAllFolders();

    if (folders.length === 0) {
      return res.status(404).json({ message: "No folders found" });
    }

    return res.status(200).json(folders);
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

const getFilesInFolder = async (req, res) => {
  const { folderId } = req.params;
  if (!folderId) {
    return res.status(400).json({ message: "Folder ID is required in params" });
  }

  try {
    const files = await fileService.fetchFilesByFolder(folderId);

    if (files.length === 0) {
      return res
        .status(404)
        .json({ message: "Folder not found or has no files" });
    }

    return res.status(200).json(files);
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

const getSortedFilesInFolder = async (req, res) => {
  const { folderId } = req.params;
  const { sort } = req.query;

  if (!folderId) {
    return res.status(400).json({ message: "Folder ID is required in params" });
  }

  const validSortFields = ["size", "uploadedAt"];
  if (!validSortFields.includes(sort)) {
    return res.status(400).json({
      error: "Invalid sort field. Only 'size' and 'uploadedAt' are allowed.",
    });
  }

  try {
    const files = await fileService.getFilesSorted(folderId, sort);

    if (files.length === 0) {
      return res.status(404).json({ message: "Folder has no files" });
    }

    return res.status(200).json(files);
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

const getFilesByType = async (req, res) => {
  const { type } = req.query;
  if (!type) {
    return res
      .status(400)
      .json({ message: "File type query parameter is required" });
  }

  try {
    const files = await fileService.getFilesByType(type);

    if (files.length === 0) {
      return res.status(404).json({ message: "No files found" });
    }

    return res.status(200).json({ files });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

const getFilesMetaData = async (req, res) => {
  const { folderId } = req.params;

  if (!folderId) {
    return res.status(400).json({ message: "Folder ID parameter is required" });
  }

  try {
    const files = await fileService.getFilesMetaData(folderId);

    if (files.length === 0) {
      return res.status(404).json({ message: "No files found in this folder" });
    }

    return res.status(200).json({ files });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

module.exports = {
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
  getFilesMetaData,
};
