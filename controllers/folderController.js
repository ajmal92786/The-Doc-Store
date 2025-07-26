const Folder = require("../models/Folder");
const File = require("../models/File");
const folderService = require("../services/folderService");
const cloudinary = require("../config/cloudinary");
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

    // Validate folder existence
    const folder = await Folder.findByPk(folderId);
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Check if file is  attached
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { originalname, mimetype, size, path } = req.file;

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
    const result = await cloudinary.uploader.upload(path, {
      resource_type: "auto",
      folder: `TheDocStore/${folder.name}`,
      public_id: `${originalname.split(".")[0]}_${Date.now()}`,
    });
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

module.exports = { createFolder, updateFolder, deleteFolder, uploadFile };
