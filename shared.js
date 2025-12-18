import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import { getConfig } from "./config.js";

export const $uuid = uuidv4;
export const isSupportType = (v) => ["png", "svg"].includes(v);
export const isString = (v) => typeof v === "string";
export const isNumber = (v) => typeof v === "number";

// format reponse body
export function success(res, data = null) {
  res.json({
    success: true,
    msg: "success",
    data,
  });
}

// format reponse body
export function error(res, data = null, msg = "", statusCode = 200) {
  res.status(statusCode).json({
    success: false,
    msg: msg || "error",
    data,
  });
}

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

// password must be equal to expectedPassword
export function matchAccount(account, expectedPassword) {
  const accountZod = z.object({
    email: z.email(),
    password: z
      .string()
      .min(6, "password too short")
      .max(32, "password too long"),
  });

  const result = accountZod.safeParse(account);
  if (!result.success) {
    return false;
  }
  return result.data.password === expectedPassword;
}

// create token
function createToken(account, opts) {
  return jwt.sign(account, opts.secret, opts.options);
}
export const createAccessToken = (account) =>
  createToken(account, getConfig("accessTokenOpts"));
export const createRefreshToken = (account) =>
  createToken(account, getConfig("refreshTokenOpts"));

// verify token
function verifyToken(token, opts) {
  try {
    jwt.verify(token, opts.secret, opts.options);
    return true;
  } catch (e) {
    return false;
  }
}
export const verifyAccessToken = (accessToken) =>
  verifyToken(accessToken, getConfig("accessTokenOpts"));
export const verifyRefreshToken = (refreshToken) =>
  verifyToken(refreshToken, getConfig("refreshTokenOpts"));

// parseToken
function parseToken(token, opts) {
  try {
    // exclude iat and exp field
    const { iat, exp, ...rest } = jwt.verify(token, opts.secret, opts.options);
    return rest;
  } catch (e) {
    return {};
  }
}
export const parseRefreshToken = (token) =>
  parseToken(token, getConfig("refreshTokenOpts"));
