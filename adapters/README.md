# AI 工具接入桥

这些小模板把当前 AI 工具接入同一份 AIDLC 工作流。**只安装使用者当前选择的工具桥，不一次安装全部工具配置。** 业务流程只保存在 `.aidlc/system/`，桥文件负责发现和按需读取，不复制整套 Prompt。v0.3 起主对话只编排，每次阶段执行或返工都派发新的独立上下文子 Agent；桥文件本身不提供这项运行能力。

| 当前工具 | 本目录模板 | 目标仓库入口 | 安装方式 |
| --- | --- | --- | --- |
| Codex | [codex.md](codex.md) | 根目录 `AGENTS.md` | 新建或合并受控块；先检查 `AGENTS.override.md` |
| Claude Code | [claude-code.md](claude-code.md) | 根目录 `CLAUDE.md` | 新建或合并受控块；保留现有规则和导入 |
| Cursor | [cursor.mdc](cursor.mdc) | `.cursor/rules/aidlc.mdc` | 新的独立规则文件，保留 YAML frontmatter |
| GitHub Copilot | [github-copilot.md](github-copilot.md) | `.github/copilot-instructions.md` | 新建或合并受控块 |

## 合并约定

1. 先读取目标文件和适用的上级/子目录指令；只在用户指定仓库内工作，不修改全局配置。
2. Markdown 入口不存在时新建；存在且没有 AIDLC 块时，保留原文并追加一次。桥块以 `<!-- AIDLC-AGENTS:START -->` 和 `<!-- AIDLC-AGENTS:END -->` 为边界。
3. 已存在完整块时先比较：内容一致不再写；不同则展示块内更新差异，取得确认后仅替换块内内容。不得改动块外文本。发现不完整、多组或嵌套 marker 时停止自动合并，让使用者处理冲突。
4. Cursor 的 `.cursor/rules/aidlc.mdc` 如果已经存在，**不自动覆盖**。说明冲突；内容一致则跳过，否则由使用者决定保留或接受更新。不得覆盖其他 Cursor rules 或移除 `.cursorrules`。
5. Codex 同目录若存在 `AGENTS.override.md`，普通 `AGENTS.md` 可能不会被读取。报告当前生效文件；在使用者确认合并位置前，不改 override、不声称接入完成。嵌套目录也要检查适用的 override。
6. 不把现有 `.claude/CLAUDE.md`、`.claude/rules/`、Copilot path instructions 或其他工具配置删掉。多份配置存在时先检查冲突，不用新桥掩盖冲突。

## 完成标准

安装后必须能读取目标仓库中的 router、protocol 与 [orchestration.md](../workflow/orchestration.md)。按 [setup 指引](../bootstrap/setup.md) 做只读子 Agent 探针：实际创建新子 Agent、确认未继承父对话历史、取得结构化结果。记录真实调用/子 Agent 标识、上下文模式与返回证据；不能只凭文件已写入或模型声称支持就通过。不创建需求或批准记录、不改业务代码，完成检查后即停下。

文件检查、显式读取、工具自动加载与子 Agent 能力分别报告。只有前三项通过但没有子 Agent 能力，仍然不能运行阶段。探针通过也不表示已验证真实需求、完整审批行为或 CI Gate。用户另行要求时才开始需求演练。

若自动加载没有生效，先开新会话/重新载入项目，再使用明确读取提示：

> 请先读取当前仓库的 `.aidlc/system/skills/aidlc/SKILL.md`、`.aidlc/system/workflow/protocol.md` 和 `.aidlc/system/workflow/orchestration.md`；验证当前工具能创建独立上下文子 Agent 并收集返回结果后，主对话只编排，每个阶段派发新子 Agent，完成后返回结果并等待我的审批。

显式读取只补足规则加载，不能替代子 Agent 能力。缺少新建、上下文隔离或结果回收任一能力时，报告阻塞并切换支持的客户端，不允许退回当前上下文执行阶段。不编造跨工具通用的 spawn API，也不自动改全局配置。工具适配的验证范围与官方文档见 [支持矩阵](../docs/tool-support.md)。已有安装先按 [update 指引](../bootstrap/update.md) 升级，不直接覆盖现有桥或工作记录。
