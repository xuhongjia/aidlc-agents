# 原版本工作兼容

0.13 不把 V2.1 回填到旧 work：0.12 及以前继续原 TDD 责任、单/双执行者 Gate 调度和原 Standard Release/Learn 链；不能用新终点提前结束旧需求或补造过去 RED。缺原资产即 blocked。仅升级后的新工作采用 Implement-only Skill、两个 Reviewer 与 verified handoff。

0.12 不迁移任何旧工作、批准或授权；旧 dispatch 不补 instruction_refs/pipeline_requests/wait_request，不替换原 worker/知识/Gate 契约，不自动增加 checkpoint、纠错、CI/CD 读取、监控或发布权限。0.11 工作继续原 state 4/dispatch 4/result 3 和原资产，不能接受新版 waiting_external。

- 已有 workflow_ref：读该 work 的原始方法与冻结资产（含 0.9 的 DAG 规则），不读活动目录的新 Prompt 替换旧资产。
- 更早、无 workflow_ref 的工作：按其原 method_revision、原 catalog/profile 顺序及原审批策略运行，不补造 DAG 锁。
- 缺原版本文件/摘要、版本混合或无法确定方法时 blocked，先恢复已记录来源；不要用本页概述重建历史执行规则。
- core/team 更新仍等待未结束 work 和活动 worker 完成。新需求使用已安装新版本；仅补安全缺省，不从旧授权推导新增权限。

当前协议只解释新工作；内置阶段名仍作配方说明，不能作为定制 DAG 的隐式依赖。
