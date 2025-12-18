import z from "zod";
import { getConfig } from "./config.js";
import { isNumber, isString, isSupportType, verifyAccessToken } from "./shared.js";

export function handleImagePlaceholderOpts(req, res, next) {
  const config = getConfig();

  const options = {
    width: 600,
    height: 400,
    bg: "#dddddd",
    color: "#888888",
    text: "",
    type: "svg", // svg or png
  };

  const colorZod = z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^([a-f0-9]{6}|[a-f0-9]{3})$/, "invalid color");

  const queryZod = z.object({
    w: z.number().min(10).max(2000).optional(),
    h: z.number().min(10).max(2000).optional(),
    bg: colorZod.optional(),
    c: colorZod.optional(),
    text: z.string().optional(),
    type: z.enum(["png", "svg"]).default("svg"),
  });

  // http://localhost:3000
  // http://localhost:3000?w=400&h=200
  // http://localhost:3000?w=400&h=200&c=888
  // http://localhost:3000?w=400&h=200&c=888&bg=fff
  const { query } = req;
  if (isString(query.w)) query.w = parseInt(query.w);
  if (isString(query.h)) query.h = parseInt(query.h);
  const result = queryZod.safeParse(query);
  if (!result.success) {
    return config.error(res, result.error);
  }
  const { w, h, c, bg, text, type } = result.data;
  if (isSupportType(type)) options.type = type;
  if (isNumber(w)) options.width = w;
  if (isNumber(h)) options.height = h;
  if (isString(c)) options.color = `#${c}`;
  if (isString(bg)) options.bg = `#${bg}`;
  options.text = isString(text) ? text : `${options.width}x${options.height}`;

  req.options = options;
  next();
}

export function auth(req, res, next) {
  const config = getConfig();

  // must be have authorization header
  const { authorization } = req.headers;
  if (!authorization) {
    return config.error(res, null, "please login first", 401);
  }

  if (!verifyAccessToken(authorization)) {
    return config.error(res, null, "invalid access token or token expired", 401);
  }

  next();
}
