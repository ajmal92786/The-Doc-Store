const File = require("../models/File");
const { getFolderByFolderId } = require("./folderService");
// const cloudinary = require("../config/cloudinary");

const updateFileDescription = async ({ folderId, fileId, description }) => {
  // Check if file exists in the specified folder
  const file = await File.findOne(
    { where: { folderId, fileId } },
    { description }
  );

  if (!file) {
    const err = new Error("File not found in the folder");
    err.statusCode = 404;
    throw err;
  }

  // Update description
  file.description = description;
  await file.save();

  return {
    fileId: file.fileId,
    description: file.description,
  };
};

const deleteFileById = async (folderId, fileId) => {
  const file = await File.findOne({ where: { folderId, fileId } });

  if (!file) {
    const err = new Error("File not found in the folder");
    err.statusCode = 404;
    throw err;
  }

  // Delete from Cloudinary
  // if (file.cloudinaryPublicId) {
  //   await cloudinary.uploader.destroy(file.cloudinaryPublicId);
  // }

  await file.destroy();

  return { fileId };
};

const fetchFilesByFolder = async (folderId) => {
  const folder = await getFolderByFolderId(folderId);
  if (!folder) return [];

  const files = await File.findAll({
    where: { folderId },
    attributes: ["fileId", "name", "description", "size", "uploadedAt"],
  });

  return files;
};

const getFilesSorted = async (folderId, sortField) => {
  const folder = await getFolderByFolderId(folderId);
  if (!folder) return null;

  const files = await File.findAll({
    where: { folderId },
    order: [[sortField, "ASC"]],
  });

  return files;
};

module.exports = {
  updateFileDescription,
  deleteFileById,
  fetchFilesByFolder,
  getFilesSorted,
};
