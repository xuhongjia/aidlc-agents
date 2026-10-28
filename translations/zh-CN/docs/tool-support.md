# AI 工具支持与验证边界

`aidlc-agents` 是由 AI 工具执行的协作协议，不是另一个 Agent 运行器。它不要求 Python setup，不配置模型密钥，也不替换使用者的 IDE、权限系统或 CI/CD。**v0.3 要求每次阶段执行或返工创建新的独立上下文子 Agent；主对话只编排、回收结果和收集人工审批。** 不能把同一对话中切换角色当成子 Agent。

## 支持矩阵

“文档对齐”表示厂商提供相关接入机制，不表示本项目已在每种客户端完成端到端实测。工具版本、组织策略、权限和当前会话暴露的工具能力决定实际可用性；所有客户端均需通过 [setup](../bootstrap/setup.md) 的只读能力探针。

| 工具 | 默认入口 | 独立子 Agent 的文档依据 | 执行条件 |
| --- | --- | --- | --- |
| Codex | `AGENTS.md` | 官方描述创建、等待和回收子 Agent | 当前宿主需证明可新建不携带父对话历史的子 Agent；不能从“支持多 Agent”推断隔离模式 |
| Claude Code | `CLAUDE.md` | 官方描述普通子 Agent 以独立上下文启动；fork 会继承父历史 | 使用新建、非 fork 子 Agent，不 resume 先前阶段 |
| Cursor | `.cursor/rules/aidlc.mdc` | 官方描述子 Agent 从干净上下文启动，并返回父 Agent | 当前客户端需暴露实际可调用的委派和返回能力 |
| GitHub Copilot | `.github/copilot-instructions.md` | 仓库指令/自定义 Agent 不等于所有产品面都有独立子 Agent | 只在当前客户端实测新建、隔离、返回均通过后运行，否则阻塞 |
| 其他 AI 工具 | 显式读取 router + protocol + orchestration | 不假设通用 API | 同样通过探针；仅可读文件或生成建议不足以运行阶段 |

默认只写当前工具的桥。可选原生薄 Skill 入口仍可放在 Codex `.agents/skills` 或 Claude Code `.claude/skills`，但 **Skill 加载不等于创建子 Agent**。不为获得能力自动安装额外运行器、改全局配置或提升权限；由用户在受支持客户端中重新验证。

## 各工具注意点与官方来源

**Codex。** `AGENTS.override.md` 可能优先于同目录 `AGENTS.md`，嵌套指令也影响生效范围。官方说明 Codex 能启动子 Agent、等待结果并汇总；具体上下文继承控制必须以当前宿主暴露的工具 schema 为准。例如仅当实际工具提供 `fork_turns: "none"` 这一选项时，才可用它请求无父历史；它不是本项目声明的跨客户端 API 或通用配置字段。相关依据：[AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)、[Skills](https://learn.chatgpt.com/docs/build-skills)、[Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)。

**Claude Code。** 普通子 Agent 从独立上下文开始，父 Agent 需提供必要任务信息；fork 会复制父对话，因此不能满足本项目的最小上下文要求。每个阶段都新建，不能恢复前一阶段的子 Agent。保留原有 `CLAUDE.md`、导入和 `.claude/rules`；本桥不要求创建自定义子 Agent 定义或启用额外团队功能。相关依据：[项目记忆](https://code.claude.com/docs/en/memory)、[Skills](https://code.claude.com/docs/en/skills)、[Subagents](https://code.claude.com/docs/en/sub-agents)。

**Cursor。** `.mdc` 规则使用 YAML frontmatter，本桥 `alwaysApply: true` 只引导 AIDLC 请求。官方子 Agent 文档描述独立上下文、父 Agent 提供任务信息以及返回结果，但有规则文件不等于当前客户端可用。按真实能力探针确认，不能由 AI 默默在主对话代跑。相关依据：[Rules](https://cursor.com/docs/rules)、[Subagents](https://cursor.com/docs/subagents)。

**GitHub Copilot。** 各产品面的能力不同，仓库指令、自定义 Agent profile 和能直接编辑文件均不足以证明“父 Agent 新建独立子 Agent 并回收结果”。本项目不据此承诺全部 Copilot 客户端支持阶段执行；没有可验证的委派接口就阻塞，并提示切换支持的客户端。保留已有路径指令，不自动触发云任务或向额外服务上传仓库。相关依据：[仓库指令](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions)、[自定义 Agent](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents)。

## 怎样判断“可以运行阶段”

1. **文件层**：router、protocol、orchestration 在目标仓库可读；桥 marker 唯一；已有规则未丢失。
2. **加载层**：当前工具实际读取三份文件。仅显式读取成功时记录“显式读取已验证”，不要声称“自动发现已验证”。重新加载会话可解决部分发现问题，但不能新增不存在的子 Agent 能力。
3. **能力层（setup/update 必需）**：按 setup 的只读探针实际新建子 Agent，记录真实调用或 ID、所用上下文隔离模式、返回的结构化结果。子 Agent 只读限定的包文件，不执行业务阶段；父 Agent 核对返回结果和新建/隔离证据。缺一项就是阻塞；不得用模拟输出、另起普通对话或角色扮演替代。
4. **行为层（独立验证）**：用户另行要求后，使用需求演练验证独立阶段、返工新建、结果回收、未审批不推进以及并行汇合。能力探针不是完整生命周期测试。
5. **项目层**：规范、测试命令、验收标准和 Fitness 需匹配实际项目。子 Agent 可用不代表需求正确、Gate 通过或业务验收完成。

宿主、客户端或能力配置变化后重新验证，不能沿用其他工具的探针结论。若只有顺序子 Agent 可用，可按顺序派发；“每阶段新子 Agent”仍然不可省略。并发仅在 [orchestration](../workflow/orchestration.md) 的依赖、授权、路径所有权和汇合条件满足时启用，不能以并行为由提前跨过审批点。

## 它能约束什么，不能保证什么

独立上下文不等于隔离文件系统、独立身份或不可绕过的权限边界。共享工作区的子 Agent 仍可能读到文件，协议必须限制所需输入并明确写入所有权；不把完整对话历史复制给子 Agent。主对话只保存派发记录、结果摘要、证据指针和人类决定，详细分析留在子 Agent 上下文和产物里。不要把“Architect Agent 同意”当成人类架构审批，也不要把对话中的通过当成 CI 检查执行结果。

需要强制 Gate 时，用目标项目自己的测试/静态检查工具产生证据，由 CI 必须通过的检查、分支保护及人工审阅落实。架构和 QE Agent 负责提出、维护与解释 Fitness；运行结果必须来自真实执行。没有执行、结果不完整或证据失效时，明确报告，不能补写绿色结论。

本项目不会因接入而放宽工具沙箱、读取凭据、上传项目到额外服务或授权部署。用户当前 AI 工具自身可能把上下文发送给其模型服务；项目数据仍应遵循团队的数据处理政策。
