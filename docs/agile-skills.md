# 敏捷使用与 Skills 参考

0.13.1 将 Matt Pocock engineering skills 的部分做法融入已有 AIDLC 阶段。保留 fix/enhance 三阶段、两类正文，以及 Standard 的 verified handoff 终点；没有新增设计、ticket 或 retro 阶段。

## 怎么用

只想选路线：

> 帮我判断这个需求适合 fix、enhance 还是团队流程：……。先给推荐和理由，不启动工作流。

进入交付：

> 使用 aidlc 处理：……。优先复用现有业务术语；先查仓库，只问影响行为的关键问题。将实施拆成可验收的小切片，依赖和共享文件有冲突就串行。按既定审批模式推进。

已有大需求：

> 继续 aidlc WORK-ID。从固定批准输入和任务依赖恢复，只展开当前可执行的切片。说明阻塞决定和集成检查，不重新读取整段历史聊天。

Scope/Diagnose 在 change 中合并行为、设计影响、Oracle 和切片；Standard 依次使用 Spec、Architecture、Quality、Plan。Plan 的 Task ID/依赖已可表达 ticket 关系，不要求外部 tracker。只有得到明确授权和配置后才同步 Jira/GitHub 等外部系统。

Verify 可把本轮有证据的工程摩擦沉淀为知识建议；团队显式启用 Learn 时再补真实运行反馈。工程建议与业务接受分开，不因一次问题自动增加全局 Prompt 规则。

## 参考映射

核对日期：2026-10-26；上游固定提交 [5beb35b](https://github.com/mattpocock/skills/tree/5beb35b040e3de97e54fa9e386d7e42d15c295c2/skills/engineering)。以下是设计借鉴和 AIDLC 适配，未安装、逐字移植或宣称完整支持上游命令。

| 上游 Skill | AIDLC 落点 | 适配边界 |
|---|---|---|
| ask-matt | aidlc 入口先区分咨询/配置/交付/审批 | 咨询只给路线，不建 work；不加载完整 Skill 目录 |
| grill-with-docs | Intake/Spec/Scope 的关键澄清与业务术语 | 先查代码；只追问影响决定的歧义，写已有正文，不默认新增 GLOSSARY |
| to-spec | Spec 或短流程 change | 复用已确认输入、保留来源→AC；不自动发布 issue |
| improve-codebase-architecture | Architecture 的边界与接口取舍 | 优先封装复杂性；只做需求相关分析，不默认全库扫描、HTML 报告或广泛重构 |
| to-tickets | Plan/change 的纵向切片与前置 Task ID | 一个切片能独立验证，不按技术层堆批次；无需另造 ticket 报告 |
| implement / implement-spec | Implement 的任务依赖、独占写者与最终集成 | 只在无冲突且有收益时提并行；父派发，不每票开 Agent，不自动 commit/merge |
| wayfinder | 大需求的阻塞决定与已有任务索引 | 详细决定存一处；先解决当前阻塞，不给小需求添加多会话决策流程 |
| triage | Intake/Diagnose 区分问题类型、事实和当前状态 | 查已有实现/复现；不新增 tracker 标签状态机或自动关闭 issue |
| setup-matt-pocock-skills | 现有 bootstrap/team 与最小宿主入口 | 复用项目约定；不安装整套上游工具，也不新增 setup 依赖 |
| retro | Verify 的工程经验与 Learn 的反馈修订 | 事实→影响→最小建议→验证；建议不自动改 Skills、Oracle、Gate 或企业规范 |

上游 [writing-for-agents](https://github.com/mattpocock/skills/blob/5beb35b040e3de97e54fa9e386d7e42d15c295c2/skills/productivity/writing-for-agents/SKILL.md) 进一步支持单一规则来源和条件加载。这里采用其设计原则，自行编写适合 AIDLC 的简洁指引。上游为 [MIT / Copyright (c) 2026 Matt Pocock](https://github.com/mattpocock/skills/blob/5beb35b040e3de97e54fa9e386d7e42d15c295c2/LICENSE)；未来直接引入实质文本需随带许可证。本包原有 TDD 适配仍以 [Addy Osmani 来源](engineering-skills.md) 为准，不安装第二份 TDD Skill。

## 控制加载

- Skill 包装只做入口路由；子 Agent 读取固定 worker、角色差异、当前 Prompt/模板和能力协议。
- 审批/锁/写权限/证据通则集中在 worker；双 Gate 细则集中在 gate-execution。阶段不重复整套规则。
- 正文是简明决定/差异，日志和完整候选留证据文件；批准 AC/Oracle、团队必读规则和必要业务输入仍完整读取。
- 上游短入口也会加载依赖 Skill，不能只比入口长度。量测包括阶段和两 Reviewer；重复 collector、额外 leaf、反馈、CI/知识 Hook 另计，见 [测量口径](context-efficiency.md)。

升级仅作用于新 work。已有 work 使用原锁，团队覆盖按原冲突处理；方法包不会自动修改宿主模型、推理等级、插件或工具配置。
