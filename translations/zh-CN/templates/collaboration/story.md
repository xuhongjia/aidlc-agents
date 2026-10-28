# Jira 需求准入

AIDLC_DRAFT — 用于已发现项目字段的内容映射，不要求管理员新增字段或工作类型。

## 标题、类型与来源

一个可验收的业务目标。记录项目/issue 稳定 ID、类型、PRD/原始需求版本与快照、业务负责人。Story 写用户/需求/价值；Bug 写复现、实际/预期、影响与环境；技术任务写目标、消费者和完成标准，不强塞用户故事句式。

## 行为与边界

本次范围、非目标、业务规则/不变量、权限、异常与边界、适用 NFR；不在此复制技术实现细节。

## 验收标准

| AC ID | FR/NFR 与来源 | Given / When / Then | 验证方式与判断依据 |
|---|---|---|---|

稳定 AC ID 不随排序变化。每条源 FR/NFR 有 AC 或实际批准的排除理由；未知不能写成已确认。Jira Story＋AC 即业务 Spec。

同时输出现有 acceptance.json 契约：顶层 schema_version 沿用模板，requirements 每项必须为 `{id, source_ref, ac_ids, exclusion}`，criteria 每项必须含 `{id, statement, verification, source_refs}`。statement 是含 Given/When/Then 的可验证字符串，verification 仅 automated/manual；source_refs 非空，ac_ids 引用实际 AC ID。exclusion 默认 null，有排除则记录明确 reason 与 approval_ref；未排除项 ac_ids 非空。可以追加解释字段，但不能用 acceptance_ids/approved_exclusion 或单独 given/when/then 代替这些必需键。草稿仍遵守同一字段格式，未知决定写在正文并阻断，不用空 AC 填充。

## 依赖、子任务与链接

| 子任务 ID/标题 | 用户可理解的结果 | 关联 AC | 前置依赖 | 完成判据 |
|---|---|---|---|---|

业务子任务按可验证行为拆分，不按数据库/后端/前端层堆批次。后续补充 QA 测试设计任务、GitLab 技术 Spec 的固定提交链接及测试结果入口。

## 准入与批准

列未决问题、风险、PO 真实批准记录和固定内容摘要。关键歧义、缺 AC/来源或责任人时 blocked。Jira 状态、经办人、AI 自述均不等于批准；发布需另有项目范围授权。
