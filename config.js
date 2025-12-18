const config = Object.freeze({
  port: process.env.APP_PORT || 3000,
  enableCors: true,
  prefix: "/api",
  success(res, data = null) {
    res.json({
      success: true,
      msg: "success",
      data,
    });
  },
  error(res, data = null) {
    res.json({
      success: false,
      msg: "error",
      data,
    });
  },
});

let isInitialized = false;
export function initConfig(app) {
  if (!isInitialized) {
    app.set("config", config);
  }
  return app.get("config");
}
