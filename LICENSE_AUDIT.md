# LICENSE_AUDIT.md — komari-web-stable 许可证审计

本文件记录对 **本镜像所基于的上游项目 `komari-monitor/komari-web`** 的许可证调查结果。
调查对象是上游仓库本身；本镜像（`xinian5216/komari-web-stable`）除本文档与 `UPSTREAM.md` 的说明外，
**未添加、未移除、未改写**任何许可证文件或版权声明。

调查日期：2026-09-17（针对上游 `komari-web` 至 `1.5.0` / `dec6495` 为止的全部历史）

---

## 1. 已确认事实

| # | 事实 | 取证方式 |
| --- | --- | --- |
| 1 | 上游仓库根目录及全部历史中**从未出现** `LICENSE` / `COPYING` / `NOTICE` 文件 | `git log --all --diff-filter=AD --name-only -- '*LICENSE*' '*COPYING*' '*NOTICE*'` → 输出为空 |
| 2 | `package.json` 中 `"private": true`，**没有** `license`、`author`、`repository` 字段 | 直接读取 `package.json`（`private` 在 npm 语境表示"不发布到 npm"，不是许可声明） |
| 3 | GitHub 仓库元数据 `license: null`；无 homepage、无 topics、未启用 Discussions | GitHub REST `GET /repos/komari-monitor/komari-web` |
| 4 | 上游 Release 说明（`1.5.0` / `1.4.3` / `1.5.0-fix1`）**不含**任何许可表述（仅 changelog / commit 列表） | GitHub REST Releases API + 正文检索 `licen|MIT|copyright|©` |
| 5 | **作者在本仓库内自带 MIT 许可声明**，共三处、彼此一致： | 见下 |
| 5a | `src/utils/eula.ts` 第 3 节「许可与使用边界」中文原文：**「本软件依据开源许可证（MIT）授权使用。除 MIT 许可另有规定外，本声明作为合规与风险提示的补充条款。」** | 源码第 19–21 行 |
| 5b | 同一文件英文原文：**"The Software is licensed under the MIT open-source license. Except as otherwise provided by the MIT license, this notice serves as supplementary terms for compliance and risk disclosure."** | 源码第 183–184 行 |
| 5c | `src/utils/field.ts` 第 1 行定义常量 `MIT_LICENSE`，内容为**完整 MIT 文本**，署名 **`Copyright (C) 2025 Komari Monitor`**；`src/pages/admin/about.tsx` 在「关于 → 开源」页将其作为**项目许可卡片**展示（标题 `MIT License`，描述 `Copyright (C) 2025 Komari Monitor`）；第三方组件（BSD-3 / ISC / CC-BY-4.0 等）在下方**单独列表** | 源码读取 |
| 6 | 上游 **Server** 仓库自带 `LICENSE`（MIT，原文署名 `Copyright (c) 2025 Komari Moniter`，拼写如上）；该 MIT **未附 NOTICE**，其 README 亦未就 `komari-web` 的许可证作单独说明 | 上游 `komari` 仓库 `LICENSE` / `README.md` |
| 7 | 全历史作者为上游贡献者的公开 commit 元数据；**没有任何** issue / discussion 讨论过 `komari-web` 的许可证（`org:komari-monitor license` 检索结果 0 条） | GitHub Search API |
| 8 | 镜像 `komari-theme.json` 与构建产物中**没有**许可证字段（与上游一致） | 仓库内检索 |

## 2. 可以证明的授权来源

**结论：上游作者在其自有仓库内，以书面形式明确本项目采用 MIT 许可。**

可引用的直接来源（按证明力排序）：

1. **EULA 第 3 节（作者原文，双语）** —— 明确写出 "The Software is licensed under the MIT open-source license."
   这是**版权持有人对本项目许可的正面声明**，且该文本由项目自身随应用分发（`src/utils/eula.ts`）。
2. **`MIT_LICENSE` 常量 + About 页展示** —— 作者在界面中把带 `Copyright (C) 2025 Komari Monitor` 署名的
   MIT 全文作为**项目许可**呈现，第三方组件许可单列。署名主体与上游 Server 的 MIT 版权人一致。
3. **上游 Server 仓库的 MIT**（同一版权人、同一项目族）—— 作为**旁证**（不是独立证明）：
   Server 在构建时把本前端作为默认主题嵌入并一起分发，两者由同一组织、同一版权人维护。

关于"MIT 与 EULA 的关系"：EULA 明文说明自身是"**补充条款**"，且"**除 MIT 许可另有规定外**"才适用——
即 EULA **没有**给 MIT 增加额外限制（不构成 "MIT + 附加限制" 的冲突条款）；其内容主要是合规提示、
禁止非法用途、风险与责任声明。

**因此：本镜像可以按 MIT 处理，但引用来源应为「上游作者在仓库内的明示（EULA §3 / About 页）」，
而不是"上游 Server 是 MIT 所以前端也是"。**（本审计未做后一种推定。）

## 3. 无法确认的部分

1. **缺少机器可读的许可证声明**：没有根 `LICENSE` 文件、`package.json.license` 为空、GitHub 元数据为 `null`。
   对 SPDX 扫描器、GitHub 界面、企业合规工具而言，上游仓库**仍显示为"无许可证"**。
2. **MIT 声明的覆盖范围**：作者原文使用 "The Software / 本软件"，**未按仓库边界**区分 Server 与 Web；
   没有找到任何文字明确说明"以独立仓库形式再分发本前端"是否在作者的预期之内。
3. **About 页的 Apache-2.0 卡片**：该卡片与 MIT 卡片并列且无署名描述，**无法确认**它表示"项目部分采用 Apache-2.0"
   还是"某个随附组件的许可证"。就本项目自身的许可，作者在**散文（EULA）**中只点名了 MIT。
4. **EULA 补充条款的法律可执行性**按司法辖区而异（对 MIT 授予的权利在法理上应无影响，但本文非法律意见）。
5. 上游已归档（`komari-monitor/komari` 于 2026-09-15 归档；`komari-web` 亦停止推送），
   后续**无法通过上游流程**补齐许可证元数据。

## 4. 风险

| 风险 | 等级 | 说明 |
| --- | --- | --- |
| 表述性风险（主要） | 低 | 如果本镜像把上游描述成"MIT licensed"，严格说是**引用作者在仓库内的声明**，而非引用仓库根 LICENSE 文件。应以带出处的方式表述，避免无来源断言。 |
| 合规工具无法自动识别 | 低-中 | 无根 LICENSE 文件会让下游风控/合规流程报"未识别许可证"。可（在获得维护者同意后）在本镜像补一个与作者声明内容一致的 `LICENSE` + 指向本审计。 |
| 观感风险 | 低 | 若由镜像**擅自**添加 `LICENSE`，可能被误解为"镜像作者自行许可"。故本审计**不擅自添加**，等待决定。 |
| 授权本身的风险 | 低 | 未发现与 MIT 不兼容的许可（如 GPL/AGPL）或限制再分发的条款；EULA §5.7「逆向工程（法律允许范围除外）」与 §5.1–5.6 的行为规范针对**使用行为**，对"直接使用与维护源代码"不构成限制；本项目未进行任何逆向工程。 |
| 第三方组件 | 低 | About 页列出的组件为 BSD-3 / ISC / CC-BY-4.0（Twemoji，未修改），均与 MIT 兼容。 |

## 5. 建议动作

1. **（已执行）** 修正镜像 `UPSTREAM.md` 中与事实不符的表述：原文写作"Original License | 见仓库内 `LICENSE`（原样保留，未做任何改动）"——**该文件并不存在**；已改为中性且可核查的说明，并指向本审计。
2. **（待维护者决定）** 是否在本镜像添加根 `LICENSE`（MIT，署名 `Copyright (C) 2025 Komari Monitor`），建议同时在文件首行注明："内容与上游作者在 `src/utils/eula.ts` / `src/pages/admin/about.tsx` 中的声明一致，来源见 `LICENSE_AUDIT.md`"。
3. **（待维护者决定）** 是否向上游提 issue 请求补根 LICENSE（上游已归档，预计无法处理，价值有限）。
4. **（已遵守）** 未把 Server 的 MIT 文本复制到前端仓库充当其许可证；镜像内至今没有任何 LICENSE 文件。
5. **（已遵守）** 保留上游一切署名与许可展示：`src/components/NavBar.tsx`、`src/pages/admin/about.tsx`（含 MIT / Apache-2.0 卡片与第三方组件清单）、`src/utils/field.ts`、`komari-theme.json`、README 均原样保留。

---

## 附：取证命令（可复现）

```bash
# 1) 全历史中是否出现过许可证文件（空 = 从未出现）
git log --all --diff-filter=AD --name-only --format="%h %ad %s" --date=short -- "*LICENSE*" "*COPYING*" "*NOTICE*"

# 2) package.json 许可字段
python -c "import json;d=json.load(open('package.json'));print({k:d.get(k) for k in ('private','license','author','repository')})"

# 3) GitHub 元数据
gh api repos/komari-monitor/komari-web --jq '{license,archived,pushed_at}'

# 4) 作者声明（源码内）
grep -n "MIT" src/utils/eula.ts src/utils/field.ts src/pages/admin/about.tsx
```
