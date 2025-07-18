const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Folder = sequelize.define(
  "Folder",
  {
    folderId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allow: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allow: false,
      validate: {
        notEmpty: true,
      },
    },
    type: {
      type: DataTypes.ENUM("csv", "img", "pdf", "ppt"),
      allow: false,
    },
    maxFileLimit: {
      type: DataTypes.INTEGER,
      allow: false,
    },
  },
  {
    tableName: "folders",
    timestamps: false,
  }
);

module.exports = Folder;
