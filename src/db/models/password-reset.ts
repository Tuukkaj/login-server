import { Model, ModelAttributes, DataTypes, Sequelize } from "sequelize";

class PasswordReset extends Model { }

export const passwordResetPrimaryKey = "uuid"; 

const columns: ModelAttributes = {
  [passwordResetPrimaryKey]: {
    type: DataTypes.UUID,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  token: {
    type: DataTypes.UUID,
    allowNull: false
  }
};

export const passwordResetInit = (sequelize: Sequelize) => {
  PasswordReset.init(columns, {
    sequelize
  });
};


export interface PasswordResetInterface {
  [passwordResetPrimaryKey]: string
  email: string,
  token: string
}

export default PasswordReset;