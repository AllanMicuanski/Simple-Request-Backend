const puppeteer = require("puppeteer");

module.exports = {
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  headless: true,
  executablePath: puppeteer.executablePath(),
};
