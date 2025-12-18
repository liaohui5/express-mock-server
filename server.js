import cors from "cors";
import express from "express";
import Mock from "mockjs";
import sharp from "sharp";
import { initConfig } from "./config.js";
import { createSVG, handleImagePlaceholderOpts } from "./shared.js";

const { mock } = Mock;

/////////////////////////////////////////////////
//                 init app                    //
/////////////////////////////////////////////////
const app = express();
const config = initConfig(app);
const { success, error } = config;

// parse request body
app.use(express.json({ extended: true }));

// enable cors requests
if (config.enableCors) {
  app.use(cors());
}

/////////////////////////////////////////////////
//                  routes                     //
/////////////////////////////////////////////////
app.get("/", (_, res) => success(res, "OK"));

// image-placeholder
app.get("/image-placeholder", handleImagePlaceholderOpts, (req, res) => {
  if (req.options.type === "png") {
    // response a png file
    res.type("png");
    res.setHeader("Content-Disposition", 'inline; filename="placeholder.png"');
    sharp(Buffer.from(createSVG(req.options)))
      .png({ quality: 50 })
      .pipe(res);
  } else {
    // response a svg
    res.type("svg");
    res.setHeader("Content-Disposition", `inline; filename="placeholder.svg"`);
    res.send(createSVG(req.options));
  }
});

app.get("/articles", (_, res) => {
  const articles = mock({
    page: 1,
    size: 10,
    "rows|10": [
      {
        id: "@id",
        title: "@ctitle",
        contents: "@cparagraph",
      },
    ],
  });

  success(res, articles);
});

// for post example
app.post("/login", (_, res) => {
  success(res, {
    token: "mock-token-string",
  });
});

// for patch/put example
app.patch("/article/:id", (req, res) => {
  success(res, {
    id: req.params.id,
  });
});

// for delete example
app.delete("/article/:id", (req, res) => {
  success(res, {
    id: req.params.id,
  });
});

// get env variables for test pm2 config
app.get("/env", (_, res) => {
  success(res, {
    app_port: process.env.APP_PORT,
    node_env: process.env.NODE_ENV,
    timezone: process.env.TZ,
    env: process.env,
  });
});

// global error handler
app.use((err, _req, res, _next) => {
  console.error("🤡[ ERROR ]:", err);
  return error(res, {
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

/////////////////////////////////////////////////
//                  listen                     //
/////////////////////////////////////////////////
app.listen(config.port, () => {
  const url = `http://localhost:${config.port}`;
  console.log(`server started on: ${url}`);
});
