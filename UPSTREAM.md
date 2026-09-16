# UPSTREAM.md — 上游来源与本 fork 关系（komari-web-stable）

> 溯源记录：任何时候都能据此判断"哪些是原项目代码，哪些是 Komari Stable 的改动"。

## 1. 原项目

| 项 | 值 |
| --- | --- |
| Original Project | **Komari Web**（Komari 默认主题前端，React 19 + Vite + TypeScript） |
| Original Repository | https://github.com/komari-monitor/komari-web |
| Original License | 见仓库内 `LICENSE`（原样保留，未做任何改动） |
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
4. **删除与上游耦合、或依赖本 fork 不使用的密钥的 workflow**：
   `follow-komari-release.yaml`（定时跟随上游 release 并向 komari-monitor 派发事件）、
   `generate-release-notes.yml`（依赖 `OPENAI_API_KEY`）。均以普通提交删除，**保留 git 历史**。

> 未改动：业务逻辑、协议、UI、版权与上游署名链接（Credits 属于"原项目信息"，按要求保留）。

## 4. 溯源方法

```bash
git diff upstream-baseline --stat     # 全部差异
git diff upstream-baseline -- <path>  # 单文件差异
```
