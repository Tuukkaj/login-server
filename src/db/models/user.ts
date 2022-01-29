import { Model, ModelAttributes, DataTypes, Sequelize } from "sequelize";

const modelName = "user";

class User extends Model { }

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
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
};

export const userModelInit = (sequelize: Sequelize) => {
  User.init(columns, {
    modelName,
    sequelize
  });
};


export interface UserInterface {
  uuid: string
  email: string
  password: string
}

export default User;