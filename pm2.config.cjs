module.exports = {
  apps: [
    {
      name: "express-mock-server", // 启动时的名称
      script: "./server.js",       // 执行的脚本
      cwd: ".",                    // 执行的工作目录
      watch: false,                // 是否监听文件变化并重启
      instances: 1,                // 需要启动多少个实例(多进程负载均衡)
      autorestart: true,           // 自动重启(如果意外退出)
      max_memory_restart: "500M",  // 如果内存占用超过 500M 则重启
      env: {                       // 自动设置环境变量, 不再需要 cross-env 手动设置
        NODE_ENV: "production",
        TZ: "Asia/Shanghai",       // 设置时区为上海, 否则默认是美国时间, 会影响 Date API
        APP_PORT: 8000,
      },
    },
  ],
};
