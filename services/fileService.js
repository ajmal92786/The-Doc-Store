const File = require("../models/File");

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

module.exports = { updateFileDescription };
