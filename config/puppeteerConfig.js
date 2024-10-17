const puppeteer = require("puppeteer");

module.exports = {
  executablePath:
    "/opt/render/.cache/puppeteer/chrome/linux-130.0.6723.58/chrome-linux64/chrome",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  headless: true,
  executablePath: puppeteer.executablePath(),
};
