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

module.exports = { createFolder };
