---
name: aidlc-qa
description: 接收已冻结的 AIDLC 待测候选，由 AI 浏览器执行批准业务用例并收集必要人工观察，生成可追溯 QA 结果供最终独立双 Gate 使用。
---

# QA 执行

父按 [角色协议](../../../workflow/role-delivery.md) 恢复 `team.role-delivery` 的 QA 交接，派发 fresh child；非仓库会话使用同一锁和候选的固定执行包，返回证据，由业务仓库协调器核验/推进。子 Agent 只加载 [角色执行契约](../../../workflow/role-worker.md)、`core:agents/qe.md`、[结果模板](../../../templates/collaboration/test-run.json) 及本次批准用例、候选/环境映射和浏览器授权。

先核实目标环境实际构建物对应冻结候选、用例和数据版本有效。按批准步骤准备隔离数据、执行浏览器检查、保存实际观察与证据，并清理本次创建的数据。交互只限获准测试环境、账号和动作；权限不足、环境身份不明或清理失败返回明确缺口，不自行扩大范围。

人工项目保留真实执行者和观察来源；AI 不代签。记录逐 Case/步骤实际结果、错误、`NOT_RUN`/阻塞及证据链接。不得因页面能打开、脚本退出成功或报告已上传而判 AC 通过。

发现缺陷回报 DEV；发现用例错误走 [同步协议](../../../workflow/testcase-sync.md)，本执行节点不改源码/Oracle。返回 QA 结果给父汇总；只有全部必需 QA 证据齐备后，才进入正式独立双 Gate 和最终批准。本 Skill 不自行执行或批准 Gate，不转 Jira Done、不发布生产。
