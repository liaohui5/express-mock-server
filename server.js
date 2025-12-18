import cors from "cors";
import express from "express";
import Mock from "mockjs";
import sharp from "sharp";
import { getConfig } from "./config.js";
import { auth, handleImagePlaceholderOpts } from "./middlewares.js";
import {
  $uuid,
  success,
  error,
  createAccessToken,
  createRefreshToken,
  createSVG,
  matchAccount,
  parseRefreshToken,
  verifyRefreshToken,
} from "./shared.js";

/////////////////////////////////////////////////
//                 init app                    //
/////////////////////////////////////////////////
const app = express();
const config = getConfig();
const { mock } = Mock;

// parse request body
app.use(express.json({ extended: true }));

// enable cors requests
if (config.enableCors) {
  app.use(cors());
}

/////////////////////////////////////////////////
//                  routes                     //
/////////////////////////////////////////////////
// for test server status
app.get("/", (_, res) => success(res, "OK"));

// get env variables for test pm2 config
app.get("/env", (_, res) => {
  success(res, {
    app_port: process.env.APP_PORT,
    node_env: process.env.NODE_ENV,
    timezone: process.env.TZ,
    env: process.env,
  });
});

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

// login
app.post("/login", (req, res) => {
  const loginForm = req.body;
  const expectedPassword = "e10adc3949ba59abbe56e057f20f883e";
  const isMatched = matchAccount(loginForm, expectedPassword);
  if (!isMatched) {
    return error(res, null, "invalid email or password");
  }

  const mockProfile = {
    id: $uuid(),
    username: mock("@cname"),
    email: mock("@email"),
  };

  return success(res, {
    ...mockProfile,
    accessToken: createAccessToken(mockProfile),
    refreshToken: createRefreshToken(mockProfile),
  });
});

// refresh access token
app.get("/refresh-access-token", (req, res) => {
  const { refreshToken } = req.query;
  if (!refreshToken) {
    return error(res, null, "refresh token is required");
  }
  if (!verifyRefreshToken(refreshToken)) {
    return error(res, null, "invalid refresh token or token expired");
  }

  const account = parseRefreshToken(refreshToken);
  const accessToken = createAccessToken(account); // renew accessToken

  return success(res, { accessToken });
});

app.get("/articles", auth, (_, res) => {
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

// for patch/put example
app.patch("/article/:id", auth, (req, res) => {
  success(res, {
    id: req.params.id,
  });
});

// for delete example
app.delete("/article/:id", auth, (req, res) => {
  success(res, {
    id: req.params.id,
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
