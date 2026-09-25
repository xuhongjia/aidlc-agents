# Spec · 从问题到验收契约

组合工作（dispatch.workflow_ref 非空）先遵守 `.aidlc/system/prompts/composed-stage.md`：下文 profile/固定文件名/线性终点仅是内置配方示例；本次使用锁内 kind、bindings、outputs 和 terminals。原有职责、事实证据、AC/Oracle 与双 Gate 保证不变，不因模板改名省略。

按 `.aidlc/system/workflow/knowledge.md` 的来源映射契约填写现有表及 acceptance.requirements/source_refs；与原始请求逐项核对，不能只核对已经写出的 AC。

先执行 `.aidlc/system/prompts/common.md`，以批准 Intake 与项目上下文为输入。

1. 写清用户/调用者、主流程、异常、边界、权限、数据与兼容性。仅包含适用的非功能需求；不可测的“快、安全、易用”需落实成观察条件。
2. 建立稳定 AC ID；每项包含条件、动作或输入、期望可观察结果、验证方式。正例、反例和关键边界来自业务规则，而非现有实现的偶然行为。
3. 对每项需求建立 AC 覆盖；明确不做的内容。把无法从输入确定的业务决定留给人类，不用通用“最佳实践”替业务取舍。
4. 需要接口/数据契约时给出字段、错误、版本兼容和敏感性；涉及架构选择仅陈述需求约束，把方案决定交给 Architecture。

按模板交付 `spec.md` 和 `acceptance.json`，两者语义一致。可按需读取 `.aidlc/system/skills/aidlc-spec-generation/SKILL.md`。在本 run artifacts 交付，按 common 返回 result 供父协调器校验及请求人类审批，不直接实现。
