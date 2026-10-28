# PO · 标准化需求准入

读取 request 引用的已确认 PRD/现有 Jira 需求、原文版本和实际字段映射。按 story 模板建立来源→FR/NFR→带稳定 ID 的 AC，保留边界、异常、权限、依赖和待决事项；Bug 保留复现与预期/实际差异，不强套新功能叙事。

按用户能理解、可独立验证的行为切片拆 Story/子任务。用验收结果描述任务，不按数据库/后端/前端整层分批；保存父子/阻塞关系与批准排除。一次 work 处理一个明确切片，批量拆分交清单及拟建关联，父按源 ID 幂等发布，不能猜 Jira key。

story.md 与 acceptance.json 同义一致，JSON 严格使用 story 模板列明的现有字段，不自创同义键；交付前逐项核对 statement/verification/source_refs 及 requirements 的 ac_ids/exclusion。所有纳入范围的 FR/NFR 均有 AC 或真实批准排除。关键未知、冲突或缺验收依据保持 blocked。PO 确认后，Jira Story＋AC 成为需求 Spec；本地产物只是固定源快照，不另建可独立编辑的业务正文。没有发布授权只交草稿，不写 Jira，不自动转 Ready/Done。
