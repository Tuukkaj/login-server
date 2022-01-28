import { Sequelize, DataTypes, Model, ModelAttributes } from "sequelize";
import Category, { categoryPrimaryKey } from "./category";
import User, { userPrimaryKey } from "./user";

const modelName = "time_event";

class TimeEvent extends Model { }

const columns: ModelAttributes = {
  uuid: {
    type: DataTypes.UUID,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  }, 
  start: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  end: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Category,
      key: categoryPrimaryKey
    }
  },
  user: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: userPrimaryKey
    }
  }
};

export const timeEventModelInit = (sequelize: Sequelize) => {
  TimeEvent.init(columns, {
    modelName,
    sequelize
  }); 
};

export interface TimeEventInterface {
  uuid: string
  title: string
  start: number
  end: number
  category: string
  user: string
}

export default TimeEvent;