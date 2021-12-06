import { Sequelize } from "sequelize"; 

let sequelize: Sequelize;

export default {
    init: async (): Promise<Sequelize> => {
        if(sequelize) {
            console.error("DB connection has already been initialized");
        }
        
        sequelize = new Sequelize(`postgres://${process.env.DB_USERNAME}:${process.env.DB_USERNAME}@${process.env.DB_URL}:${process.env.DB_PORT}/${process.env.DB_NAME}`); 
    
        try {
            await sequelize.authenticate();
            console.log("DB connection success"); 
        } catch(e) {
            console.error("DB connection failure", e);
            process.exit(1);
        }
    
        return sequelize; 
    }
};