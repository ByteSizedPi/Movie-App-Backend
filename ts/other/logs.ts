import * as fs from "fs";

const { log } = console;
const colors = {
  red: "\x1b[31m",
  blue: "\x1b[36m",
  magenta: "\x1b[35m",
  end: "\x1b[0m",
};

const request = (msg: string) => {
  const len = Math.floor((60 - msg.length) / 2);
  const dashes = colors.blue + "-".repeat(len) + colors.end;
  const fMsg = `\n${dashes} Request: ${colors.red}${msg}${colors.end} ${dashes}\n`;
  log(fMsg);
};

const tmdb = (count: number, start: number) => {
  let total = new Date().getTime() - start;
  log("TMDB:", count, "results", "-".repeat(5), total, "ms");
  write(`TMDB: ${total}\n`);
};

const yts = (count: number, start: number) => {
  let total = new Date().getTime() - start;
  log("YTS:", count, "results", "-".repeat(5), total, "ms");
  write(`YTS: ${total}\n`);
};

const write = (content: string) => {
  fs.appendFile("logs.txt", content, (err) => {
    if (err) return console.error(err);
  });
};

export { request, tmdb, yts };
