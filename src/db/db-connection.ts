import { Sequelize } from "sequelize";
import { categoryModelInit } from "./models/category";
import { passwordResetInit } from "./models/password-reset";
import { timeEventModelInit } from "./models/time-event";
import { unverifiedUserInit } from "./models/unverified-user";
import { userModelInit } from "./models/user";

let sequelize: Sequelize;

export default {
  init: async (): Promise<Sequelize> => {
    if (sequelize) {
      console.error("DB connection has already been initialized");
    }

    sequelize = new Sequelize(String(process.env.DATABASE_URL || ""), {
      dialectOptions: {
        ssl: process.env.NODE_ENV === "production" ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    });

    try {
      await sequelize.authenticate();
      console.log("DB connection success");
    } catch (e) {
      console.error("DB connection failure", e);
      process.exit(1);
    }

    passwordResetInit(sequelize);
    unverifiedUserInit(sequelize);
    userModelInit(sequelize);
    categoryModelInit(sequelize);
    timeEventModelInit(sequelize);

    await sequelize.sync({});

    return sequelize;
  }
};