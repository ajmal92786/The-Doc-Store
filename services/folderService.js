const Folder = require("../models/Folder");
const File = require("../models/File");
const cloudinary = require("../config/cloudinary");

const createFolder = async ({ name, type, maxFileLimit }) => {
  const existingFolder = await Folder.findOne({ where: { name } });
  if (existingFolder) {
    const error = new Error("Folder with this name already exists.");
    error.statusCode = 409;
    throw error;
  }

  return await Folder.create({
    name,
    type,
    maxFileLimit,
  });
};

const getFolderByFolderId = async (folderId) => {
  return Folder.findByPk(folderId);
};

const getFileByFolderId = async (fileId) => {
  return File.findByPk(fileId);
};

const updateFolder = async (folderId, folderData) => {
  if (!folderId) throw new Error("Folder ID is required");

  const folder = await Folder.findByPk(folderId);
  if (!folder) {
    const error = new Error("Folder not found.");
    error.statusCode = 404;
    throw error;
  }

  folder.set(folderData);
  return await folder.save();
};

const deleteFolder = async (folderId) => {
  const folder = await Folder.findByPk(folderId);
  if (!folder) {
    const error = new Error("Folder not found.");
    error.statusCode = 404;
    throw error;
  }

  //   const deletedCount = await Folder.destroy({ where: { folderId } });
  await folder.destroy(); // Deletes this specific folder instance.
  return true;
};

const uploadToCloudinary = async (path, folder, originalname) => {
  return cloudinary.uploader.upload(path, {
    resource_type: "auto",
    folder: `TheDocStore/${folder.name}`,
    public_id: `${originalname.split(".")[0]}_${Date.now()}`,
  });
};

const saveFileInDB = async (fileData) => {
  return await File.create(fileData);
};

module.exports = {
  getFolderByFolderId,
  getFileByFolderId,
  createFolder,
  updateFolder,
  deleteFolder,
  saveFileInDB,
  uploadToCloudinary,
};
