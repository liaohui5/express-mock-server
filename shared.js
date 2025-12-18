import * as z from "zod";
import { initConfig } from "./config.js";

export const isSupportType = (v) => ["png", "svg"].includes(v);
export const isString = (v) => typeof v === "string";
export const isNumber = (v) => typeof v === "number";

export function createSVG(options) {
  const fontSize = Math.floor(Math.min(options.width, options.height) / 4);
  const svg = `
<svg width="${options.width}" height="${options.height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${options.bg}"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${fontSize}" fill="${options.color}" text-anchor="middle" dominant-baseline="middle">${options.text}</text>
</svg>
`;
  return svg;
}

export function handleImagePlaceholderOpts(req, res, next) {
  const config = initConfig(req.app);

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
