import { Model, ModelAttributes, DataTypes, Sequelize } from "sequelize";

const modelName = "password_reset"; 

class PasswordReset extends Model { }

const columns: ModelAttributes = {
  uuid: {
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
    modelName,
    sequelize
  });
};


export interface PasswordResetInterface {
  uuid: string
  email: string,
  token: string
}

export default PasswordReset;