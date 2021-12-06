import { DataTypes } from "sequelize/dist";

export default {
  type: DataTypes.DATE,
  allowNull: false,
  defaultValue: () => Date.now()
};