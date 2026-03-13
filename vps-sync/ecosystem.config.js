module.exports = {
  apps: [
    {
      name: "merchant-admin",
      cwd: "/opt/vayva/apps/merchant-admin",
      script: "npx",
      args: "next start -p 3000",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_memory_restart: "512M",
      instances: 1,
      exec_mode: "fork",
    },
    {
      name: "marketing",
      cwd: "/opt/vayva/apps/marketing",
      script: "npx",
      args: "next start -p 3001",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      max_memory_restart: "384M",
      instances: 1,
      exec_mode: "fork",
    },
    {
      name: "ops-console",
      cwd: "/opt/vayva/apps/ops-console",
      script: "npx",
      args: "next start -p 3002",
      env: {
        NODE_ENV: "production",
        PORT: 3002,
      },
      max_memory_restart: "384M",
      instances: 1,
      exec_mode: "fork",
    },
  ],
};
