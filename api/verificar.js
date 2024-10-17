const puppeteer = require("puppeteer-core");
const chromium = require("chrome-aws-lambda");

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL não fornecida." });
  }

  console.log("Iniciando verificação para a URL:", url);

  try {
    let browser;

    // Verifica se está no ambiente de produção (Render) ou local
    if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
      // Ambiente serverless (Render)
      browser = await puppeteer.launch({
        args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: await chromium.executablePath,
        headless: true,
      });
    } else {
      // Ambiente local
      browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: "/usr/bin/google-chrome-stable", // Caminho para o Chrome local
        headless: true,
      });
    }

    console.log("Navegador Puppeteer iniciado");

    const page = await browser.newPage();
    const requisitions = [];
    const deploymentStatus = {
      script: false,
      gtm: false,
      vtexIO: false,
    };

    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (["image", "stylesheet", "font"].includes(request.resourceType())) {
        request.abort();
      } else {
        const requestUrl = request.url();

        if (requestUrl.includes("sizebay")) {
          requisitions.push({
            url: requestUrl,
            initiator: request.initiator(),
          });

          // Verificações de script, GTM, e VTEX IO
          if (
            requestUrl.includes("vtex_module.js") ||
            requestUrl.includes("vtexassets")
          ) {
            deploymentStatus.vtexIO = true;
          }
          if (requisitions[0].initiator.type === "script") {
            deploymentStatus.gtm = true;
          }
          if (requisitions[0].initiator.type === "parser") {
            deploymentStatus.script = true;
          }
        }
        request.continue();
      }
    });

    console.log("Indo para a URL", url);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const permalink = await page.evaluate(() => {
      return window.SizebayPrescript
        ? window.SizebayPrescript().getPermalink()
        : null;
    });

    console.log("Permalink encontrado:", permalink);

    await browser.close();

    res.status(200).json({
      requisitions,
      scriptStatus: deploymentStatus.script,
      gtmStatus: deploymentStatus.gtm,
      vtexIOStatus: deploymentStatus.vtexIO,
      permalink,
    });
  } catch (error) {
    console.error("Erro ao processar a URL:", error);
    res.status(500).json({ error: "Erro ao processar a URL." });
  }
};
