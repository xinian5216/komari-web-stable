# AGENTS.md — Komari Web Stable 工作规则

本仓库是 Komari Stable 的嵌入式核心前端镜像。允许做兼容性、安全性、可访问性、构建与 CI 修复；
不得把它改造成独立产品，也不得擅自重写界面或改变已冻结的 Server API。

## 进入仓库后先读

1. `UPSTREAM.md`：基线、fork 差异和版权边界；
2. `src/lib/repoSources.ts`：Server / Agent 下载与更新来源的唯一事实来源；
3. 与任务直接相关的页面、hook 和 `.github/workflows/web-ci.yml`。

禁止一开始递归读取全部源码。先根据页面或组件定位调用链，再扩大范围。

## 兼容性红线

- HTTP / RPC2 方法名和字段由 Komari Server 决定，只能做向后兼容适配，不能单方面改名或删除。
- Agent 远控能力是三态：
  - `remote_control_known=true` 且缺少相应 capability：必须隐藏或禁用对应入口；
  - `remote_control_known=false`：代表旧 Agent 未上报，保持历史行为；
  - 不能把“未知”误判成“明确禁用”。
- `src/lib/repoSources.ts` 是仓库来源的唯一入口，不得在组件里新增 `xinian5216` 或上游仓库硬编码。
- 新增/修改用户可见文案时同步维护所有 locale，并运行 locale 一致性检查。
- 不得删除上游署名、MIT 文本、About/Credits 或许可证取证文件。
- 不得覆盖既有 tag、Release 或重写已发布历史。

## 修改原则

- Bug 修复先补复现或最小回归测试；改动保持局部，避免顺手重构。
- 终端、文件管理、远程命令属于高风险入口；相关改动必须同时检查 capability 门禁、旧 Agent 兼容和
  Server 端拒绝逻辑。
- 构建产物由 Server 的 `bundled-themes.lock.json` 固定到不可变 tag；发布后如需修复必须递增 stable tag。
- fork 行为或维护边界变化时同步更新 `UPSTREAM.md`。

## 提交前检查

```bash
npm ci
npm run lint
npm run i18n:sync:dry
npm run build
```

提交信息使用 `fix:` / `security:` / `feat:` / `build:` / `ci:` / `docs:` / `test:` / `chore:`，
一次提交只解决一个问题。
