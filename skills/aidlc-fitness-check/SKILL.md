---
name: aidlc-fitness-check
description: 执行获批 Architecture/Quality Fitness，保留真实候选和原始证据；用于 DEV 自测或指定独立 Gate，不授予批准权。
---

# Fitness 执行

主会话正式 AIDLC 请求交 .aidlc/system/skills/aidlc/SKILL.md；有效 child 使用冻结 instruction_refs 和 workflow/gate-execution.md。单 Gate leaf 只执行指定种类，collector 只汇总；Implement 自测不冒用 Reviewer 身份。

逐规则核对批准入口/摘要、作用范围、命令/cwd、权限/副作用/超时、阈值及成功判据。用已授权本地工具执行；固定 CI 来源核对真实 job/attempt 与完整断言，不伪造本地执行或远端退出码，也不临时编写“等价”规则。

按固定 gate-result 模板保存检查数量、blocking/advisory 结果与原始证据；非零退出区分业务失败与工具故障，均不能当必需规则通过。Advisory 失败同样保留。前后候选核验、PASS 条件和执行身份以 gate-execution 为唯一规则来源；缺证据/漂移即阻塞。真实 CI 硬门禁仍由项目工具退出码、阈值和权限保护执行。
