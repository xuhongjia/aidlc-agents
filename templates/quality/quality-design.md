# Quality Design & Fitness

AIDLC_DRAFT — 根据批准的验收条件定义测试与 Oracle，完成后替换本标志。不得用当前实现的输出倒推应有行为。

## 基线与风险

引用批准 Spec/Architecture、测试基线与重点失败风险。

## 测试模型

| Test ID | AC/NFR | 场景/层级 | 输入与前置条件 | 精确预期/不变量 | 能捕获的错误 |
|---|---|---|---|---|---|

## 全量验收覆盖

`coverage.json` 的 `criteria` 与批准的 `acceptance.json` AC ID 集合一致，每项含 `id`、`checks`（Quality check ID 数组）、`manual_protocol`（人工步骤/预期/证据要求；无则 `null`）。自动 AC 至少映射一个实际 blocking check；人工 AC 有可执行协议。不得用架构检查或仅 advisory 检查代替必要质量验证。

## Quality Fitness 审核预览

| Check ID | AC/NFR | 完整命令或扫描范围 | 成功判据/预期执行数量 | 超时 | 副作用 | Blocking/Advisory |
|---|---|---|---|---|---|---|

填充 `quality-fitness.json` 的真实 `id`、`checks`。检查字段：`id`、`type`、`mode`、`description`；命令型记录完整 `argv`、前提和成功判据，模式型记录 `paths`、`pattern` 及预期。不把退出码 0、空测试集、全跳过或缺失输出直接视为通过。空规则包不是 PASS。

## 测试附件与人工验证

列出测试文件预定路径、核心断言、数据来源、安装/运行前提；未经实施批准不修改项目测试基线。人工验证注明实际执行者、环境、候选和证据要求；未执行不能预填成功。

## 审核与限制

人类确认 Oracle、覆盖、命令、阈值及残余风险；Agent 不填写批准结论。命令不得暗含依赖安装、推送、部署或其他外部写入。
