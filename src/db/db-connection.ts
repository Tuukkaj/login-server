import { Sequelize } from "sequelize";
import Category, { CategoryInterface, categoryModelInit } from "./models/category";
import TimeEvent, { timeEventModelInit, TimeEventInterface } from "./models/time-event";
import User, { UserInterface, userModelInit } from "./models/user";
import crypto from "crypto";

let sequelize: Sequelize;

export default {
  init: async (): Promise<Sequelize> => {
    if (sequelize) {
      console.error("DB connection has already been initialized");
    }

    sequelize = new Sequelize(`postgres://${process.env.DB_USERNAME}:${process.env.DB_USERNAME}@${process.env.DB_URL}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

    try {
      await sequelize.authenticate();
      console.log("DB connection success");
    } catch (e) {
      console.error("DB connection failure", e);
      process.exit(1);
    }

    userModelInit(sequelize);
    categoryModelInit(sequelize); 
    timeEventModelInit(sequelize); 

    await sequelize.sync({});

    const user: UserInterface = {
      uuid: crypto.randomUUID(),
      email: "tuukka@tuukka.fi",
    };

    const category: CategoryInterface = {
      uuid: crypto.randomUUID(),
      name: "test-category",
      user: user.uuid ?? "rip",
      icon: "icon",
      color: "color"
    };

    const event: TimeEventInterface = {
      uuid: crypto.randomUUID(),
      title: "title",
      category: category.uuid ?? "rip1",
      user: user.uuid ?? "rip2",
      start: 0,
      end: 0
    };

    await User.create(user);
    await Category.create(category); 
    await TimeEvent.create(event); 

    return sequelize;
  }
};