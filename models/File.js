const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Folder = require("./Folder");

const File = sequelize.define(
  "File",
  {
    fileId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allow: false,
      unique: true,
    },
    folderId: {
      type: DataTypes.UUID,
      references: {
        model: Folder,
        key: "folderId",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    name: {
      type: DataTypes.STRING,
      allow: false,
    },
    description: {
      type: DataTypes.TEXT,
      allow: true,
    },
    type: {
      type: DataTypes.STRING,
      allow: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allow: false,
    },
    uploadedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allow: false,
    },
  },
  {
    tableName: "files",
    timestamps: false,
  }
);

module.exports = File;
