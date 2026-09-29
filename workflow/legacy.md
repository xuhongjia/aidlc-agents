# 原版本工作兼容

0.11 不迁移任何旧工作、批准或授权；旧 dispatch 不补 instruction_refs，不替换原 worker/知识/Gate 契约，不自动增加 checkpoint、纠错或发布权限。

- 已有 workflow_ref：读该 work 的原始方法与冻结资产（含 0.9 的 DAG 规则），不读活动目录的新 Prompt 替换旧资产。
- 更早、无 workflow_ref 的工作：按其原 method_revision、原 catalog/profile 顺序及原审批策略运行，不补造 DAG 锁。
- 缺原版本文件/摘要、版本混合或无法确定方法时 blocked，先恢复已记录来源；不要用本页概述重建历史执行规则。
- core/team 更新仍等待未结束 work 和活动 worker 完成。新需求使用已安装新版本；仅补安全缺省，不从旧授权推导新增权限。

当前协议只解释新工作；内置阶段名仍作配方说明，不能作为定制 DAG 的隐式依赖。
