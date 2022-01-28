import { Model, ModelAttributes, DataTypes, Sequelize } from "sequelize";

const modelName = "unverified_user";

class UnverifiedUser extends Model { }

export const unverifiedUserPrimaryKey = "uuid"; 

const columns: ModelAttributes = {
  [unverifiedUserPrimaryKey]: {
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
  },
  token: {
    type: DataTypes.UUID,
    allowNull: false
  }
};

export const unverifiedUserInit = (sequelize: Sequelize) => {
  UnverifiedUser.init(columns, {
    modelName,
    sequelize
  });
};


export interface UnverifiedUserInterface {
  [unverifiedUserPrimaryKey]: string
  email: string,
  password: string, 
  token: string
}

export default UnverifiedUser;