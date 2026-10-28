# UPSTREAM.md — 上游来源与本 fork 关系（komari-web-stable）

> 溯源记录：任何时候都能据此判断"哪些是原项目代码，哪些是 Komari Stable 的改动"。

## 1. 原项目

| 项 | 值 |
| --- | --- |
| Original Project | **Komari Web**（Komari 默认主题前端，React 19 + Vite + TypeScript） |
| Original Repository | https://github.com/komari-monitor/komari-web |
| Original License | **MIT**（依上游作者在其仓库内的明示：`src/utils/eula.ts` 第 3 节「本软件依据开源许可证（MIT）授权使用」/ "The Software is licensed under the MIT open-source license"，以及 `src/pages/admin/about.tsx` 中署名 `Copyright (C) 2025 Komari Monitor` 的 MIT 卡片）。**上游根目录没有 `LICENSE` 文件**；本 fork 已新增根目录 `LICENSE`，将源码中现有 MIT 声明逐字提升为机器可读文件，未改变作者授权。完整取证见 [`LICENSE_AUDIT.md`](./LICENSE_AUDIT.md) |
| Copyright / Credits | 归原作者与贡献者所有；`src/components/NavBar.tsx`、`src/pages/admin/about.tsx`、`komari-theme.json` 等处的上游链接与署名**全部保留** |

## 2. Fork 基线

| 项 | 值 |
| --- | --- |
| Fork 日期 | 2026-09-16 |
| 基线 ref | upstream tag `1.5.0` |
| 基线 commit | `dec649518a769882308ab80794c633bf6bfc265b` |
| 维护分支 | `stable`（本仓库默认分支） |
| 只读镜像分支 | `upstream-baseline`（= 上述基线 commit，**永不修改**） |
| 固定 tag | `v1.5.0-stable.0` |
| 维护者 | `xinian5216` |

## 3. 本 fork 的改动（相对上游基线）

1. **新增 `src/lib/repoSources.ts`**：把 owner/repo 集中到单一定义处（`FORK_OWNER` / `SERVER_REPO` /
   `AGENT_REPO` / `AGENT_REPO_BRANCH`），供安装命令、Docker 镜像、版本检查引用。
2. **Agent 安装来源切换**（`src/components/admin/NodeTable/NodeFunction.tsx`、`src/pages/admin/index.tsx`）：
   `raw.githubusercontent.com/komari-monitor/komari-agent/...` → 本 fork 的 `xinian5216/komari-agent-stable`；
   Docker 安装命令的镜像 `ghcr.io/komari-monitor/komari-agent:latest` → `ghcr.io/xinian5216/komari-agent-stable:latest`。
3. **升级检查来源与 stable 修订比较**（`src/components/admin/AdminPanelBar.tsx`、
   `src/lib/serverRelease.ts`）：GitHub releases 查询由上游 komari 仓库改为本 fork 的
   `xinian5216/komari-stable`；比较时把 `stable.N` 纳入版本顺序，确保同一基础版本的维护发布会显示更新提示。
4. **新增根 `LICENSE`**：上游仓库从未有过根 `LICENSE` 文件（`package.json` 无 `license` 字段、
   GitHub 元数据为 `null`），但作者在本仓库源码内已明确声明 MIT（`src/utils/eula.ts` §3、
   `src/pages/admin/about.tsx` 的 MIT 卡片、`src/utils/field.ts` 的 `MIT_LICENSE` 常量）。
   本 fork 把该正文**逐字**提升为根 `LICENSE`（署名保持 `Copyright (C) 2025 Komari Monitor`），
   属于把作者已有声明变为机器可读，**不是重新授权**；取证与决定记录见 [`LICENSE_AUDIT.md`](./LICENSE_AUDIT.md)。
5. **删除与上游耦合、或依赖本 fork 不使用的密钥的 workflow**：
   `follow-komari-release.yaml`（定时跟随上游 release 并向 komari-monitor 派发事件）、
   `generate-release-notes.yml`（依赖 `OPENAI_API_KEY`）。均以普通提交删除，**保留 git 历史**。
6. **移除远程控制 UI**（Issue #1）：删除远程命令、终端、Agent 文件管理、xterm 设置页面及其
   hooks/context/依赖；节点与自动发现安装命令不再生成任何远控开关。静态 CI 守卫禁止恢复入口或调用。
  7. **新增前端硬门禁 CI**：`web-ci.yml` 执行 `npm ci`、lint、locale 同步检查与生产构建。
  8. **PWA navigation fallback 不再接管后台核心路径**（`vite.config.ts`）：Workbox
     allowlist 只保留公开 SPA（`/`、`/instance/*`、`/plugin/*`）；`/admin`、`/terminal`、
     `/manage`、`/install`、`/database-recovery` 进入 denylist，避免 `theme=next` 时把
     Next 首页 HTML 当成 `/admin` 的离线回退。CI 在生产构建后检查源码与 `dist/sw.js`。

> 作者署名与上游链接未改；根目录 `LICENSE` 是 fork 新增文件，正文沿用源码中的 MIT 声明。除上述改动外，其余 UI 与业务逻辑**以保持上游基线为默认目标**；依赖安全维护、构建/CI 与测试基建等变更随各 stable 版本分批进入，逐版本记录见下方清单与对应 tag 的 Release Notes，精确差异以 `git diff upstream-baseline` 为准。

9. **前端依赖安全维护**（`v1.5.0-stable.5`）：定向更新 Vite 至 6.4.4、source-map-js 至
   1.2.2；移除无源码调用的 `http-proxy-middleware` 及其传递代理依赖，消除 follow-redirects
   与 micromatch → braces 链的生产依赖告警。保留 About 页历史 Credits，不改 UI、API 与 PWA 路由策略。
10. **依赖安全维护与测试基建**（`v1.5.0-stable.6`）：
    - zod 4.4.3 → 4.6.7，并给 `src/pages/admin/pprof.tsx` 的 `pprofSummarySchema.profiles`
      增加 `.max(16)` 长度上限（GHSA-mrhx-c7xc-m3w5 / CVE-2023-54404：无长度约束的数组 schema
      会为每个失败元素累积一个校验问题，耗尽内存；zod ≥ 4.6.6 先做 size 检查，但版本升级本身
      不覆盖无界数组，故同时加上显式上限）；
    - fast-uri 3.1.9、serialize-javascript 7.1.4（已知漏洞修复）；
    - 显式声明 `@types/node` ^22.20.5 为 devDependency，避免重新生成 lockfile 时丢失 Node 类型；
    - safe-npm-updates 组 22 项 minor/patch 更新（react/react-dom 19.3.1、@radix-ui/themes 3.3.0、
      @tailwindcss/vite 4.3.3 等）；
    - 新增 Playwright 浏览器冒烟套件（`tests/smoke/`、`playwright.config.ts`、
      `.github/workflows/browser-smoke.yml`）：对生产构建（`vite preview`）驱动真实 Chromium，
      公开页所需 API/RPC2 由 `tests/smoke/fixtures.ts` 模拟（不连接真实 Server），7 个用例并含
      破坏性 mock 的负向控制；该套件成为 stable 的必需门禁之一。`npm run test:e2e` 即
      `npm run build && playwright test`。

## 4. 溯源方法

```bash
git diff upstream-baseline --stat     # 全部差异
git diff upstream-baseline -- <path>  # 单文件差异
```
