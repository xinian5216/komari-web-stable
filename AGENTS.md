# AGENTS.md — Komari Web Stable 工作规则

本仓库是 Komari Stable 的嵌入式核心前端镜像。允许做兼容性、安全性、可访问性、构建与 CI 修复；
不得把它改造成独立产品，也不得擅自重写界面或改变已冻结的 Server API。

## 进入仓库后先读

1. `UPSTREAM.md`：基线、fork 差异和版权边界；
2. `src/lib/repoSources.ts`：Server / Agent 下载与更新来源的唯一事实来源；
3. 与任务直接相关的页面、hook 和 `.github/workflows/web-ci.yml`。
4. 提交 / CI / 发布任务读取 `.github/REQUIRED_CHECKS.md`、安全和密钥扫描 workflow；
   Node / npm 与构建 workflow 保持一致，依赖版本以清单和锁文件为准。

禁止一开始递归读取全部源码。先根据页面或组件定位调用链，再扩大范围。

## 兼容性红线

- HTTP / RPC2 方法名和字段由 Komari Server 决定，只能做向后兼容适配，不能单方面改名或删除。
- 远程命令、终端与 Agent 文件管理已按安全决策移除；不得恢复页面、菜单、安装参数、API/RPC 调用或依赖。
- `/terminal` 必须继续处于 PWA navigation denylist，使请求到达 Server 的 `410 Gone` tombstone。
- `src/lib/repoSources.ts` 是仓库来源的唯一入口，不得在组件里新增 `xinian5216` 或上游仓库硬编码。
- 新增/修改用户可见文案时同步维护所有 locale，并运行 locale 一致性检查。
- 不得删除上游署名、MIT 文本、About/Credits 或许可证取证文件。
- 不得覆盖既有 tag、Release 或重写已发布历史。

## 修改原则

- Bug 修复先补复现或最小回归测试；改动保持局部，避免顺手重构。
- 远控移除边界属于高风险安全约束；相关改动必须运行 `npm run test:remote-control-removed`，并确认
  Server 端 `410`、RPC 注销和事件拒绝仍生效。
- 构建产物由 Server 的 `bundled-themes.lock.json` 固定到不可变 tag；发布后如需修复必须递增 stable tag。
- fork 行为或维护边界变化时同步更新 `UPSTREAM.md`。

## 提交前检查

```bash
npm ci
npm run lint
npm run test:server-updates
npm run test:remote-control-removed
npm run i18n:sync:dry
npm run build
npm run test:sw-routes
npm audit --omit=dev --audit-level=high
python3 .github/scripts/check-workflow-pins.py
gitleaks git . --log-opts="--all" --redact
gitleaks dir . --redact
```

`test:sw-routes` 必须在构建后运行，覆盖实际生成的 Service Worker。生产依赖扫描通过不代表
开发 / 构建依赖无漏洞；依赖维护时还需检查完整审计报告并说明范围、可达路径和兼容性。
不得通过强制降级、批量更新、移除安全检查或忽略告警来使门禁变绿。

依赖 / 路由 / 认证相关修改应在隔离 Server 实例验证首页、密码登录、后台页面及正常 / 旧缓存路径；
记录测试版本、执行范围与未覆盖项，不能把源码守卫等同于真实浏览器验证。

## 合并与发布

- 所有变更经 PR 进入 `stable`，等待 `.github/REQUIRED_CHECKS.md` 全部门禁成功；
  CodeQL 不能代替 npm audit，失败、取消或跳过不算通过。
- 发布前复核合并后精确 commit 的检查与不可变 tag；Server 采用新 Web 需要另行更新
  `bundled-themes.lock.json` 并重新构建 / 发布，不能声称前端发版已更新现有 Server。
- 推送、合并、发布和线上部署按本次任务明确授权的范围执行；已有授权无需重复确认。
  不在维护任务中自动操作生产环境。

提交信息使用 `fix:` / `security:` / `feat:` / `build:` / `ci:` / `docs:` / `test:` / `chore:`，
一次提交只解决一个问题。
