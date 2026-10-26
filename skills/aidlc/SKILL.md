---
name: aidlc
description: 在已接入 aidlc-agents 的仓库按意图选择流程，协调独立阶段子 Agent、状态、审批和恢复。
---

# AIDLC · 父协调器

只路由、调度、验真和处理批准；正式阶段须真实 fresh-context child，不能内联或用角色切换模拟。未带前缀的路径相对 .aidlc/system；带 .aidlc/system 前缀的路径相对项目根。已有 work 均从其原方法副本解析，不套活动安装。

## 按意图只读一条入口

| 请求 | 加载与动作 |
|---|---|
| setup aidlc / setup check / setup status / 配置必需接入 | skills/aidlc-setup/SKILL.md；安装、检查或配置后停止，不建 work |
| 选流程/怎么开始 | workflow/profiles.md；给推荐、理由、下一步。仅咨询不建 work、不查新、不派发；信息不足只问改变路线的关键问题 |
| 配置团队流程 | skills/aidlc-workflow/SKILL.md、bootstrap/team.md |
| setup confluence / 知识库接入 | skills/aidlc-knowledge-setup/SKILL.md |
| setup gitlab / 公司 CI/CD 接入 | skills/aidlc-pipeline-setup/SKILL.md |
| 查询状态 | 指定 work 的 state/证据；多 work 未指定先问，不启动 worker |
| 仅审批 | 原 review/批准/候选、workflow/approval.md、workflow/identity.md；未授权继续就停 |
| 终结/closing/closed | workflow/closure.md；未停 worker 不标 closed |
| 知识重试 | workflow/knowledge-publish.md；核验原快照/授权，不重启交付 |
| 流水线唤醒/停止等待 | 原方法的 workflow/pipeline-wait.md，仅已有 wait；旧版/未登记只报告状态，不补字段/监控 |
| 新需求/继续实施 | 先 .aidlc/system/workflow/preflight.md；新工作先更新，已有工作固定原方法/图/授权。低于 0.12 按 workflow/legacy.md 恢复 |

配置完成即停，不隐式启动交付/监控/发布。参考资料或“讨论一下”不代表授权建需求、发布 ticket 或写外部系统。

## 交付执行链

1. 读 config/state 与 .aidlc/system/workflow/protocol.md。新 work 按 profiles + extensions 解析已注册图；旧 work 核验 workflow_ref。
2. 按 workflow/dag.md 找 ready 节点；workflow/orchestration.md 管 spawn/collect、候选和停止；workflow/context.md 推导完整 instruction_refs。每 run 用 prompts/composed-stage.md，仅传固定 packet，不传父历史或全套 Skills。
3. 首个只读 child 核实风险，首卡确认图/范围/产物。按 workflow/approval.md 处理 manual/checkpoint_low_risk/auto_low_risk；路由 auto 不是批准，checkpoint 最终 Verify 仍人审。
4. 核验 worker、输入、完整候选、必需检查/证据，建立不可覆盖 review。卡片仅写差异、新决定、风险与链接；结果不等于批准，只批准而未授权继续则停。

条件动作：非零预算的 feedback_request 才读 workflow/implementation-feedback.md，先记账再派新 run；其他失败停止并按原协议撤销委托/交人决定。waiting_external 走 pipeline-wait，不晋升通过/审批；配置 delivery 的新工作按 pipeline-config 冻结。

Verify 父验真读 workflow/gates.md；身份刷新读 identity；知识批准/晋升读 .aidlc/system/workflow/knowledge.md，发布另派 Hook。Release/Learn 取证读 external-evidence。未触发不展开。stage/leaf/Hook 共同计入容量和更新阻断。

图/职责/授权变化保留旧快照并重新确认；completed 不再派发，closed 不复活授权。本包是宿主协作协议，不是不可绕过的权限系统。
