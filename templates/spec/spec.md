# Specification

AIDLC_DRAFT — 以已批准 Intake 和项目事实填写可实现、可验证的规格，再替换本标志。

## 输入基线与边界

引用已批准 review、项目画像、原始需求、范围及非目标；解释本次改变与保留的行为。

## 功能与验收

| FR ID / 原始来源引用 | 场景 | 行为 | AC ID 或排除批准/理由 | Given / When / Then |
|---|---|---|---|---|

将每个 AC 同步写入 `acceptance.json` 的 `criteria`，每项为唯一 `id`、可验证的 `statement`、`verification`（`automated` 或 `manual`）和 `source_refs`。在同一 JSON 的 `requirements` 保存每个 FR/NFR 的 `{id, source_ref, ac_ids, exclusion}`；exclusion 默认为 null，排除必须有明确理由及批准依据。真实验收集合不得为空或遗漏；模板空数组只表示未定义。

## 契约、状态和边界

记录输入输出、数据与接口、权限、错误、边界情况、状态变化、兼容性及迁移约束。

## 非功能要求

| NFR ID | 可测要求与阈值 | 原始来源引用 | AC ID 或排除批准/理由 | 验证方法 |
|---|---|---|---|---|

阈值必须有依据；Agent 建议须经人类审核，不能写成组织既定要求。

## 追踪与未决事项

说明需求 → FR/NFR → AC → 验证方法的对应关系。关键业务歧义及影响验收的未知项未解决时保持 `blocked`。
