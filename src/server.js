import bcrypt from "bcrypt";
import cors from "cors";
import express from "express";
import sharp from "sharp";
import { getConfig } from "./config.js";
import { Article, initDatabase, User } from "./database.js";
import { auth, handleImagePlaceholderOpts } from "./middlewares.js";
import {
  createAccessToken,
  createRefreshToken,
  createSVG,
  error,
  matchAccount,
  parsePagination,
  parseRefreshToken,
  success,
  verifyRefreshToken,
} from "./shared.js";

/////////////////////////////////////////////
//                 init app                //
/////////////////////////////////////////////
const app = express();
const config = getConfig();
const router = express.Router();

// init database
await initDatabase();

// parse request body
app.use(express.json({ extended: true }));

// enable cors requests
if (config.enableCors) {
  app.use(cors());
}

/////////////////////////////////////////////
//            app debug routes             //
/////////////////////////////////////////////
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

/////////////////////////////////////////////
//                api routes               //
/////////////////////////////////////////////
router
  .post("/login", async (req, res) => {
    // login
    const loginForm = req.body;
    if (!matchAccount(loginForm)) {
      return error(res, null, "invalid email or password");
    }

    const user = await User.findOne({
      where: {
        email: loginForm.account,
      },
      attributes: ["id", "username", "email", "password"],
    });

    if (!user) {
      return error(res, null, "invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(loginForm.password, user.password);

    if (!isPasswordValid) {
      return error(res, null, "invalid email or password");
    }

    const { password: _, ...userWithoutPassword } = user.toJSON();

    return success(res, {
      ...userWithoutPassword,
      accessToken: createAccessToken(userWithoutPassword),
      refreshToken: createRefreshToken(userWithoutPassword),
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
  .get("/articles", auth, async (req, res) => {
    // for get articles example
    const pagination = parsePagination(req.query);
    const offset = (pagination.page - 1) * pagination.limit;
    const limit = pagination.limit;

    const datas = await Article.findAndCountAll({
      offset,
      limit,
    });
    success(res, datas);
  })
  .post("/articles", auth, async (req, res) => {
    // for post example
    const { title, author, content } = req.body;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await Article.create({
      id,
      title,
      author,
      content,
      createdAt: now,
      updatedAt: now,
    });
    const article = await Article.findByPk(id);
    success(res, article.toJSON());
  })
  .patch("/articles/:id", auth, async (req, res) => {
    // for patch/put example
    const { id } = req.params;
    const { title, author, content } = req.body;
    const now = new Date().toISOString();
    const updateData = {};
    const updateFields = [];

    if (title !== undefined) {
      updateFields.push("title");
      updateData.title = title;
    }
    if (author !== undefined) {
      updateFields.push("author");
      updateData.author = author;
    }
    if (content !== undefined) {
      updateFields.push("content");
      updateData.content = content;
    }

    if (updateFields.length > 0) {
      updateData.updatedAt = now;
      await Article.update(updateData, { where: { id } });
    }

    const article = await Article.findByPk(id);
    success(res, article ? article.toJSON() : null);
  })
  .delete("/articles/:id", auth, async (req, res) => {
    // for delete example
    const { id } = req.params;
    await Article.destroy({ where: { id } });
    success(res, { id });
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

/////////////////////////////////////////////
//                  listen                     //
/////////////////////////////////////////////
app.listen(config.port, () => {
  const url = `http://localhost:${config.port}`;
  console.log(`server started on: ${url}`);
});
