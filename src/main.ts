import { writeFile } from "fs";
import { createInterface } from "readline";

require('dotenv').config();

if(!process.env.TOKEN) {
  let data = '';

  const rl = createInterface({
      input: process.stdin,
      output: process.stdout
  });

  const token = () => {
    return new Promise((resolve, reject) => {
      rl.question("Bot Token > ", (ans) => {
        resolve(ans);
      });
    });
  }

  const mainServerID = () => {
    return new Promise((resolve, reject) => {
      rl.question("Main Server ID > ", (ans) => {
        resolve(ans);
      });
    });
  }

  const mongoDB = () => {
    return new Promise((resolve, reject) => {
      rl.question("MongoDB URI > ", (ans) => {
        resolve(ans);
      });
    });
  }

  const main = async() => {
    const TOKEN = await token();
    const MAIN_SERVER_ID = await mainServerID();
    const MONGODB_URI = await mongoDB();

    data = `TOKEN=${TOKEN}\nMAIN_SERVER_ID=${MAIN_SERVER_ID}\nMONGODB_URI=${MONGODB_URI}`;

    writeFile('.env', data, (err) => {
      if(!err) require('./index');
      else console.log(err);
    });
  }

  main();
} else require('./index')