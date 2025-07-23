const folderService = require("../services/folderService");

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

module.exports = { createFolder };
