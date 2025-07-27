const File = require("../models/File");
// const cloudinary = require("../config/cloudinary");

const updateFileDescription = async ({ folderId, fileId, description }) => {
  // Check if file exists in the specified folder
  const file = await File.findOne(
    { where: { folderId, fileId } },
    { description }
  );

  if (!file) {
    const err = new Error("File not found in the specified folder");
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

module.exports = { updateFileDescription, deleteFileById };
