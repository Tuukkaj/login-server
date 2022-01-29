import { Model, ModelAttributes, DataTypes, Sequelize } from "sequelize";
import User from "./user";

const modelName = "category";

class Category extends Model { }

export const categoryPrimaryKey = "uuid"; 

const columns: ModelAttributes = {
  [categoryPrimaryKey]: {
    type: DataTypes.UUID,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: "uuid"
    }
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false
  }
};

export const categoryModelInit = (sequelize: Sequelize) => {
  Category.init(columns, {
    modelName,
    sequelize
  });
};

export interface CategoryInterface {
  uuid: string 
  name: string 
  user: string 
  icon: string 
  color: string
}

export default Category;