import { Model, ModelAttributes, DataTypes, Sequelize } from "sequelize";

const modelName = "user";

class User extends Model { }

export const userPrimaryKey = "uuid"; 

const columns: ModelAttributes = {
  [userPrimaryKey]: {
    type: DataTypes.UUID,
    primaryKey: true
  },
  email: {
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
}

export default User;