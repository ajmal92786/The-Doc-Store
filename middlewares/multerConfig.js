const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer disk storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Folder where file will be stored
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// File size limit: 10MB
const limits = { fileSize: 10 * 1024 * 1024 }; // 10 MB

// Allowed file types
const allowedTypes = [
  "text/csv",
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
];

const fileFilter = function (req, file, cb) {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only CSV, PDF, JPEG and PNG files are allowed", false));
  }
};

const upload = multer({ storage, limits, fileFilter });

module.exports = upload;
