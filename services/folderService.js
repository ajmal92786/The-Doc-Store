const Folder = require("../models/Folder");

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

module.exports = { createFolder, updateFolder };
