# Komari Web Stable

这是 [Komari Web](https://github.com/komari-monitor/komari-web) 的社区维护分支，也是
[`komari-stable`](https://github.com/xinian5216/komari-stable) 随包内嵌的**核心前端**：
管理后台、安装/恢复页面和内置 `default` 主题。新装实例的首选前台主题是另外打包的
[`komari-next-stable`](https://github.com/xinian5216/komari-next-stable)。

本 fork 的源码差异和授权取证见 [UPSTREAM.md](./UPSTREAM.md) 与
[LICENSE_AUDIT.md](./LICENSE_AUDIT.md)。安装命令和版本检查使用
`src/lib/repoSources.ts` 指定的 Stable 仓库；原作者署名与 Credits 保留。

## 开发

建议 Node.js 22 或更高版本。在仓库根目录运行：

```bash
npm ci
cp .env.example .env.development
# 在 .env.development 设置 VITE_API_TARGET=http://127.0.0.1:25774
npm run dev
```

`vite.config.ts` 在开发时将 `/api` 和 `/themes` 代理到 `VITE_API_TARGET`；
没有配置时默认 `http://127.0.0.1:25774`。前端的独立开发服务器需要一个正在运行的
Komari Server。

## 构建与检查

```bash
npm run lint
npm run i18n:sync:dry
npm run test:remote-control-removed
npm run test:sw-routes
npm run test:server-updates
npm run build
```

构建产物位于 `dist/`。Server 的 `bundled-themes.lock.json` 将本仓库固定到指定 tag/commit，
其构建流程会把核心前端嵌入 Server；单独运行这里的 `npm run build` 不会更新已安装的面板。

## 作为自定义主题

仓库提供 `komari-theme.json` 和 `build-theme.sh`（Linux）。如需制作自己的主题：
先按上文配置和构建，确认 `dist/` 存在，再把 `dist/` 与
`komari-theme.json` 放在 ZIP 根目录（按你的主题修改名称、短名称和设置），
通过 Komari 后台上传。主题包格式以 Server 的主题上传校验为准。

## Stable 的安全边界

本分支已移除远程命令、终端与 Agent 文件管理的前端入口和调用。
Server 端也对旧远控路由返回 `410 Gone` 并拒绝远控事件；旧 Agent 的监控上报仍受支持。
相关修改应遵守 [AGENTS.md](./AGENTS.md)，并运行上述回归检查。
