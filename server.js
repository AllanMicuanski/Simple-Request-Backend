const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const verificar = require("./api/verificar");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/verificar", verificar);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
