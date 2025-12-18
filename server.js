import cors from "cors";
import express from "express";
import sharp from "sharp";
import { zocker } from "zocker";
import z from "zod";
import { getConfig } from "./config.js";
import { auth, handleImagePlaceholderOpts } from "./middlewares.js";
import {
  createAccessToken,
  createRefreshToken,
  createSVG,
  error,
  matchAccount,
  parseRefreshToken,
  success,
  verifyRefreshToken,
} from "./shared.js";

/////////////////////////////////////////////////
//                 init app                    //
/////////////////////////////////////////////////
const app = express();
const config = getConfig();
const router = express.Router();

// parse request body
app.use(express.json({ extended: true }));

// enable cors requests
if (config.enableCors) {
  app.use(cors());
}

/////////////////////////////////////////////////
//            app debug routes                 //
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

/////////////////////////////////////////////////
//                  api routes                 //
/////////////////////////////////////////////////
router
  .post("/login", (req, res) => {
    // login
    const loginForm = req.body;
    const expectedPassword = "e10adc3949ba59abbe56e057f20f883e";
    const isMatched = matchAccount(loginForm, expectedPassword);
    if (!isMatched) {
      return error(res, null, "invalid email or password");
    }

    const mockProfile = zocker(
      z.object({
        id: z.uuid(),
        username: z.string(),
        email: z.string(),
      }),
    ).generate();

    return success(res, {
      ...mockProfile,
      accessToken: createAccessToken(mockProfile),
      refreshToken: createRefreshToken(mockProfile),
    });
  })
  .get("/refresh_access_token", (req, res) => {
    // refresh access token
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
  })
  .get("/articles", auth, (_, res) => {
    // for get articles example
    const datas = zocker(
      z.object({
        id: z.uuid(),
        title: z.string(),
        author: z.string(),
        content: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    ).generateMany(10);
    success(res, { total: 50, datas });
  })
  .post("/articles", auth, (req, res) => {
    // for patch/put example
    success(res, req.body);
  })
  .patch("/articles/:id", auth, (req, res) => {
    // for patch/put example
    success(res, { id: req.params.id });
  })
  .delete("/articles/:id", auth, (req, res) => {
    // for delete example
    success(res, { id: req.params.id });
  });

// apply router to app
app.use(config.prefix, router);

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
