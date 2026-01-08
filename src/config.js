import { isString } from "./shared.js";

const config = Object.freeze({
  port: process.env.APP_PORT || 3000,
  enableCors: true,
  prefix: "/api",
  accessTokenOpts: {
    secret: "mock-access-token-secret",
    options: {
      algorithm: "HS256",
      expiresIn: "10s",
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
