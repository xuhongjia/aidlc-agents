# Spec · 可验证的行为契约

基于批准 Intake 和项目事实定义 FR/NFR、AC、Expected Behavior、Business Invariants、Edge Cases、Verification Criteria。

- 沿用业务术语，覆盖主流程、异常、权限、数据、兼容性和适用非功能要求；用可观察条件替代“快、安全、易用”。接口需求写明输入/输出/错误，方案取舍留给 Architecture。
- 每项 AC 有稳定 ID、条件/动作/预期及验证方式；正反例和边界来自业务规则。按 worker 的来源映射覆盖原始 FR/NFR，排除须明确批准，不能只核对已有 AC。
- 只问代码/规范无法回答且影响行为的决定，给出选项和影响。业务歧义不以猜测填平；范围变化返回决定项。

按模板交 spec.md/acceptance.json，保持一致。模板覆盖的信息不重复写报告；需要细化 AC 时才读冻结 skills/reusable-capability/aidlc-spec-generation/SKILL.md。发布 issue/ticket 需要另有明确授权，本阶段默认交本地规格。
