# AI 工具支持与验证边界

`aidlc-agents` 是由 AI 工具读取并执行的协作协议，不是另一个 Agent 运行器。它不要求 Python setup，不配置模型密钥，也不替换使用者的现有 IDE、权限系统或 CI/CD。

## 支持矩阵

下表的“文档对齐”表示厂商提供该接入机制、模板按该机制设计，**不表示本项目已在每个工具和客户端完成端到端实测**。工具版本、组织策略、上下文和文件访问能力会影响结果。

| 工具 | 默认接入 | 可选原生 Skill 位置 | 本项目当前支持边界 |
| --- | --- | --- | --- |
| Codex | `AGENTS.md` 小桥 | `.agents/skills/<name>/SKILL.md` | 文档对齐；显式读取 canonical 文件为兜底 |
| Claude Code | `CLAUDE.md` 小桥 | `.claude/skills/<name>/SKILL.md` | 文档对齐；不假设它读取 `AGENTS.md` |
| Cursor | `.cursor/rules/aidlc.mdc` | 本版不依赖原生 Skill 发现 | 文档对齐；使用有效 `.mdc` frontmatter |
| GitHub Copilot | `.github/copilot-instructions.md` 小桥 | 本版不依赖原生 Skill 发现 | 文档对齐；以当前客户端的文件/Agent 能力为准 |
| 其他 AI 工具 | 用户明确要求读取 router + protocol | 由工具自身决定 | 手动接入；无本地文件能力时只能咨询，不能声称完成 setup |

默认仅写当前工具的桥。可选 Skill 位置说明工具能力，并不表示 setup 会额外复制全部 Skill。需要可见的原生 Skill 菜单时，再由用户选择安装薄入口；遇到同名 Skill 不覆盖。每个入口仍指向同一 canonical 工作流，避免版本分叉。

## 各工具注意点

**Codex。** 仓库指令在启动时发现，同一目录的 `AGENTS.override.md` 优先于 `AGENTS.md`；嵌套配置可能改变结果。因此 setup 要确认生效范围，而不是只写一个根文件。原生 Skill 可放在仓库 `.agents/skills`，发现异常时开新会话再核验。[官方 AGENTS.md 文档](https://learn.chatgpt.com/docs/agent-configuration/agents-md)、[官方 Skill 文档](https://learn.chatgpt.com/docs/build-skills)。

**Claude Code。** 仓库级 `CLAUDE.md` 用于持久指令，项目 Skill 使用 `.claude/skills`。本桥采用显式读取而不是自动导入整套流程，控制每次上下文的体积；现有 `CLAUDE.md`、导入和 `.claude/rules` 均保留。新会话可用 `/context` 检查 Memory files。[官方项目记忆文档](https://code.claude.com/docs/en/memory)、[官方 Skill 文档](https://code.claude.com/docs/en/skills)。

**Cursor。** `.cursor/rules` 下的规则采用 `.mdc` 与 YAML frontmatter。本模板使用 `alwaysApply: true`，但正文仅在 AIDLC 任务时加载工作流；不常驻注入全部角色 Prompt。不声称创建规则即完成实际加载验证。[官方 Rules 文档](https://cursor.com/docs/rules)。

**GitHub Copilot。** 仓库级入口是 `.github/copilot-instructions.md`；其他路径指令可以并存，不应覆盖。Copilot 各产品面的功能支持不同，使用者需处于能操作目标仓库的 Agent 环境。若当前对话只能给建议，则改用具备本地文件权限的环境；可按客户端支持检查响应 references 中的指令来源。[官方仓库指令文档](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions)。

## 怎样判断“已经接入”

1. **文件层**：canonical router/protocol 在目标仓库可读；桥文件正确、marker 唯一；安装前已有指令未丢失。
2. **加载层**：在当前工具的新会话中，明确让它读取两个 canonical 文件，列出真实存在的入口和下一个审批点。若工具仅通过这次明确读取才接入，记录为“显式读取已验证”，不要称为“自动发现已验证”。
3. **行为层（单独验证）**：用户另行要求后，以无业务副作用的需求演练，只完成当前阶段并停在审批点；不给审批时不得推进。缺少必要文件或证据时应报告阻塞。setup 不创建需求来完成这项测试，`ready` 也不代表它已通过。
4. **项目层**：检查项目规范、测试命令、验收标准和适用 Fitness 是否已确认。Bridge 验证成功不代表真实需求、Gate 或交付完成。

## 它能约束什么，不能保证什么

桥与 Skill 为模型提供明确流程，不能形成不可绕过的权限边界。角色 Agent 是逻辑角色，默认不代表原生并发进程或独立审批身份。不要把“Architect Agent 同意”当成人类架构审批，也不要把对话中的通过当成 CI 检查执行结果。

需要强制 Gate 时，用目标项目自己的测试/静态检查工具产生证据，由 CI 必须通过的检查、分支保护及人工审阅落实。架构和 QE Agent 负责提出、维护与解释 Fitness；运行结果必须来自真实执行。没有执行、结果不完整或证据失效时，明确报告，不能补写绿色结论。

本项目不会因接入而放宽工具沙箱、读取凭据、上传项目到额外服务或授权部署。用户当前 AI 工具自身可能把上下文发送给其模型服务；项目数据仍应遵循团队的数据处理政策。
