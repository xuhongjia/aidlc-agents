---
name: aidlc-learn
description: 在 AIDLC learn 阶段用新子 Agent 主动读取 Git/CI 实际交付与 Jira 反馈，按候选和目标归因并交回真实结果。
---

# learn 阶段

## 主会话入口与子 Agent 执行

- 在主会话调用本 Skill：只返回 `.aidlc/system/skills/aidlc/SKILL.md` 的派发流程，由父协调器创建新的隔离子 Agent；不得在当前上下文直接执行本阶段。
- 在子 Agent 调用本 Skill：必须已有有效的 learn dispatch，按固定 worker 与 instruction_refs 核对输入/批准、版本和权限；无包、错阶段或漂移则 blocked，不读取父调度协议或自行派发。
- 有效子 Agent 执行固定 PO 角色、当前 Stage/Prompt/模板及必需 instruction_refs，不以活动 system 文件替换冻结资产。不继承父聊天历史，不启动下一阶段。

## 产物与返回

完整阶段在 ready_for_review 前按固定 knowledge-prepare 根据实际反馈形成架构/质量/反模式/经验的新版本，保留来源/原批准，不静默覆盖设计或修改企业规范、Oracle、Gate、Skills。发布内容在审查前冻结；只返回附件，获批后由独立 Hook 发布。等待期间不准备最终知识。

若 dispatch 的 kind=leaf，只完成其局部任务和 expected_outputs，不生成整阶段产物；以下完整交付要求适用于 kind=stage。

按阶段契约在本 run 授权的 artifacts 目录交付 outcome.md、outcome.json；证据写本 run 的 evidence。按固定 result 模板返回 ready_for_review、blocked 或 failed。有固定 pipeline_requests 才按 pipelines 取证；尚在执行可返回 waiting_external 与真实 wait_request，然后停止，不把等待当收益结论。

先按 `.aidlc/system/workflow/external-evidence.md` 检索 Git/CI/Jira，记录反馈作者/原文/时间/版本和 source-index；kind=leaf 只交分配片段。真实证据仍不足才 blocked/inconclusive，指出具体缺口。审批人可按 closure.md 直接终结，由父协调器执行；不推断上线/收益，不改批准历史或系统 Skills。

除明确授权的 Implement 业务写入外，只能写 dispatch 分配的 run 输出。不得写 state、questions、approvals、drafts、reviews 或配置；review 晋升、状态维护和人类批准由父协调器处理。需要独立叶子任务时只向父协调器提出有边界的建议，不自行递归派发。
