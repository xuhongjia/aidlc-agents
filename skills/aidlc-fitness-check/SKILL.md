---
name: aidlc-fitness-check
description: 执行 AIDLC 已批准的 Architecture 和 Quality Fitness，记录冻结候选上的真实证据与未知状态，不自动批准。
---

# Fitness 执行与证据

在主会话的正式 AIDLC 请求先交 `.aidlc/system/skills/aidlc/SKILL.md` 派发；有效 dispatch 子 Agent 读取 `.aidlc/system/prompts/common.md`、批准候选和本任务 Fitness。由协议区分 Implement 自测与正式 Verify；本 Skill 不修改批准规则，不推进/批准阶段，不递归派发。证据仅写父协调器分配的本 run 路径，结论汇入调用阶段 result，不写状态/审批/review。

## 执行前

先读 `.aidlc/system/workflow/gates.md`。所有路线均要求 Architecture 与 Quality；缺规则或实现时阻塞并按该协议回退补建，不在 Verify 自造替代规则，不用人工观察/N/A 替代执行。

1. 核对规则来源、revision、真实 SHA-256 和候选文件摘要；查看每条命令、范围、运行目录、依赖、超时、阈值及副作用。缺少 hash 工具或必要权限时阻塞。
2. 使用宿主工具实际执行项目已批准的检查入口。不能执行的命令标为 UNKNOWN，不用自行编写的“等价”检查替代批准规则。
3. 未获授权不联网、安装工具、访问外部系统或改变文件权限；不把 shell 包装或环境变量隐藏在不透明命令中。

只有同一冻结候选、独立证据/临时目录、无共享可写数据库/缓存/端口/环境状态时，才向父协调器建议将 Architecture 与 Quality Gate 拆成并行叶子任务。父协调器分配容量和唯一路径；本 Skill 不自行启动 Agent。存在资源冲突或无法证明隔离时串行运行。

## 结果判断

- 记录准确命令/工具、环境、时间、候选、规则摘要、退出码、超时及原始日志/报告位置。
- PASS 需要真实执行、明确断言/成功证据和有效作用范围；零测试、全部跳过、空范围、缺失报告、工具故障或无法确认的输出为 UNKNOWN，不能绿灯。
- 非零结果区分检查发现与工具运行失败，但两者都不能作为阻塞规则通过。Advisory 的失败也必须保留，不隐藏风险。
- 检查后重新核对候选；检查改变了相关源码/配置/测试时，证据失效并报告，不在 Verify 自动修复。
- 证据文件保留来源并按协议纳入 review 清单。摘要必须由工具实际计算，不能根据内容猜造。

按 gate-result 模板分别写 architecture-gate.json、quality-gate.json，记录非零 blocking 检查和原始输出，并总结逐 AC 结论、限制及阻塞。单 Gate leaf 只写分配种类，Verify 汇总 child 收齐两类并核验同一候选。AI 汇总不是确定性 Gate 引擎；生产 CI 必须用项目工具的退出码、明确阈值与权限保护来强制执行。
