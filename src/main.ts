import { writeFile } from "fs";
import { input } from "./helper/util";

require('dotenv').config();

if(!process.env.TOKEN) {

  const main = async() => {
    const TOKEN = await input('TOKEN> ');
    const MAIN_SERVER_ID = await input('Main Server ID> ');
    const MONGODB_URI = await input('MongDB > ');

    const data = `TOKEN=${TOKEN}\nMAIN_SERVER_ID=${MAIN_SERVER_ID}\nMONGODB_URI=${MONGODB_URI}`;

    writeFile('.env', data, (err) => {
      if(!err) require('./index');
      else console.log(err);
    });
  }
  main();
} else require('./index')