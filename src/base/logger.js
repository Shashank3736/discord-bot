"use strict";

const { createLogger, config, format, transports, exitOnError } = require("winston");
const message = require("../config/message");
const { readFile } = require("fs");

const myFormat = format.printf(({ level, message, label, timestamp }) => {
    return `[${new Date()}] [${level.toUpperCase()}] - ${label}: ${message}`
})
const Logger = createLogger({
    levels: config.syslog.levels,
    format: format.combine(
        format.colorize(),
        myFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({filename: "temporary.log"})
    ],
    exitOnError: false,
    exceptionHandlers: [
        new transports.Console(),
        new transports.File({filename: "exceptions.log"})
    ]
});

module.exports = Logger;
/*
Logger.info({message: "Checking logging at info level", label: "Any Bruh", timestamp: Date.now()});
Logger.debug({message: "Checking logging at debug level", label: "Any Bruh", timestamp: Date.now()});
Logger.notice({message: "Checking logging at notice level", label: "Any Bruh", timestamp: Date.now()});
Logger.warning({message: "Checking logging at info level", label: "Any Bruh", timestamp: Date.now()});
Logger.error({message: "Checking logging at info level", label: "Any Bruh", timestamp: Date.now()});
Logger.crit({message: "Checking logging at info level", label: "Any Bruh", timestamp: Date.now()});
Logger.alert({message: "Checking logging at info level", label: "Any Bruh", timestamp: Date.now()});
Logger.emerg({message: "Checking logging at info level", label: "Any Bruh", timestamp: Date.now()});

readFile("temporary.log", "utf-8", (err, data) => {
    if(err) return Logger.error({label: "READ FILE ERROR", message: err})
    console.log(data)
});
*/