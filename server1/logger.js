const { createLogger, format, transports } = require("winston");
const path = require("path");

const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(
    (info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
  )
);

const logger = createLogger({
  level: "info",
  format: logFormat,
  transports: [
    // info log
    new transports.File({
      filename: path.join(__dirname, "../logs/info.log"),
      level: "info",
    }),
    // error log
    new transports.File({
      filename: path.join(__dirname, "../logs/error.log"),
      level: "error",
    }),

    //console
    new transports.Console(),
  ],
});

module.exports = logger;
