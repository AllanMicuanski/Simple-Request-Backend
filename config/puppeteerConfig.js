const chromium = require("chrome-aws-lambda");

module.exports = {
  args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
  headless: true,
  executablePath: await chromium.executablePath,
};
