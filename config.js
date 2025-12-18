import { isString } from "./shared.js";

const config = Object.freeze({
  // format reponse body
  success(res, data = null) {
    res.json({
      success: true,
      msg: "success",
      data,
    });
  },

  // format reponse body
  error(res, data = null, msg = "", statusCode = 200) {
    res.status(statusCode).json({
      success: false,
      msg: msg || "error",
      data,
    });
  },

  port: process.env.APP_PORT || 3000,
  enableCors: true,
  prefix: "/api",
  accessTokenOpts: {
    secret: "mock-access-token-secret",
    options: {
      algorithm: "HS256",
      expiresIn: "60s",
    },
  },
  refreshTokenOpts: {
    secret: "mock-refresh-token-secret",
    options: {
      algorithm: "HS256",
      expiresIn: "7d",
    },
  },
});

export const getConfig = (keyPath) => {
  if (isString(keyPath)) {
    // TODO: support nested keyPath, use lodash: _.get(config, keyPath)
    return config[keyPath];
  }
  return config;
};
