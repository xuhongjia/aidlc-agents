---
name: aidlc-test-generation
description: 为 AIDLC 批准 AC 设计有独立 Oracle 的测试与覆盖映射；按当前阶段权限产生草案或实施测试。
---

# 需求驱动测试

这是阶段子 Agent 的复用能力，不转换状态。在主会话的正式 AIDLC 请求先交 `.aidlc/system/skills/aidlc/SKILL.md` 实际派发；有效 dispatch 子 Agent 遵循 `.aidlc/system/prompts/common.md`，不再次派发。仅 Implement 同时获得批准 Plan 和明确文件所有权时可写项目测试；其它阶段只写本 run artifacts。结果汇入调用阶段 result 返回父协调器，不写状态/审批/review。

- 输入为批准 AC、接口/数据规则、Architecture 约束和已有测试约定。确定测试层次、入口、夹具与隔离方式；不任意引入测试框架。
- 每项测试映射 AC ID，声明输入/前置条件、期望结果及能失败的具体断言。预期来自需求，不复制实现行为作为真理。
- 覆盖正例、反例、边界和适用回归；说明 Mock 与真实依赖验证各自证明什么，不用全 Mock 冒充集成通过。
- 不能自动化的 AC 明确人工观察步骤、证据和确认角色。零测试/跳过不算已验证。
- 若生成源码，检查其测试发现规则和运行入口。只有真实执行后才能记录结果，未执行要说明原因。

输出可追踪的测试设计/源码及覆盖缺口。发现 Oracle 不明确或错误时请求澄清/回退，不自行改验收标准。
