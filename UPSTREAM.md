# UPSTREAM.md — 上游来源与本 fork 关系（komari-web-stable）

> 溯源记录：任何时候都能据此判断"哪些是原项目代码，哪些是 Komari Stable 的改动"。

## 1. 原项目

| 项 | 值 |
| --- | --- |
| Original Project | **Komari Web**（Komari 默认主题前端，React 19 + Vite + TypeScript） |
| Original Repository | https://github.com/komari-monitor/komari-web |
| Original License | **MIT**（依上游作者在其仓库内的明示：`src/utils/eula.ts` 第 3 节「本软件依据开源许可证（MIT）授权使用」/ "The Software is licensed under the MIT open-source license"，以及 `src/pages/admin/about.tsx` 中署名 `Copyright (C) 2025 Komari Monitor` 的 MIT 卡片）。**上游根目录没有 `LICENSE` 文件**，本镜像保持原状、未添加也未移除任何许可证文件；完整取证见 [`LICENSE_AUDIT.md`](./LICENSE_AUDIT.md) |
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
3. **升级检查来源**（`src/components/admin/AdminPanelBar.tsx`）：GitHub releases 查询由上游 komari 仓库
   改为本 fork 的 `xinian5216/komari-stable`。
4. **新增根 `LICENSE`**：上游仓库从未有过根 `LICENSE` 文件（`package.json` 无 `license` 字段、
   GitHub 元数据为 `null`），但作者在本仓库源码内已明确声明 MIT（`src/utils/eula.ts` §3、
   `src/pages/admin/about.tsx` 的 MIT 卡片、`src/utils/field.ts` 的 `MIT_LICENSE` 常量）。
   本 fork 把该正文**逐字**提升为根 `LICENSE`（署名保持 `Copyright (C) 2025 Komari Monitor`），
   属于把作者已有声明变为机器可读，**不是重新授权**；取证与决定记录见 [`LICENSE_AUDIT.md`](./LICENSE_AUDIT.md)。
5. **删除与上游耦合、或依赖本 fork 不使用的密钥的 workflow**：
   `follow-komari-release.yaml`（定时跟随上游 release 并向 komari-monitor 派发事件）、
   `generate-release-notes.yml`（依赖 `OPENAI_API_KEY`）。均以普通提交删除，**保留 git 历史**。
6. **Agent 远控能力门禁**（`v1.5.0-stable.1` 起）：新增 `useRemoteControlClients`、终端工作区 capability
   状态和全 locale 文案。Agent 明确上报缺少 `exec` / `terminal` / `file` 能力时，隐藏或禁用对应入口；
   未上报 capability 的旧 Agent 保持原有行为。节点安装命令把远控改为显式 opt-in。
  7. **新增前端硬门禁 CI**：`web-ci.yml` 执行 `npm ci`、lint、locale 同步检查与生产构建。
  8. **PWA navigation fallback 不再接管后台核心路径**（`vite.config.ts`）：Workbox
     allowlist 只保留公开 SPA（`/`、`/instance/*`、`/plugin/*`）；`/admin`、`/terminal`、
     `/manage`、`/install`、`/database-recovery` 进入 denylist，避免 `theme=next` 时把
     Next 首页 HTML 当成 `/admin` 的离线回退。CI 在生产构建后检查源码与 `dist/sw.js`。

> 版权、许可证与上游署名链接未改。除上述仓库来源和远控安全门禁外，其余 UI 与业务逻辑保持上游基线。

## 4. 溯源方法

```bash
git diff upstream-baseline --stat     # 全部差异
git diff upstream-baseline -- <path>  # 单文件差异
```
