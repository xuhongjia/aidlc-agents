# 每条路线都必须有双 Gate

standard、enhance、fix 的 Verify 都必须执行 **Architecture Gate（Architect Gate）** 和 **Quality Gate**。每类至少一项与本变更相关、可执行、非空范围的 blocking 检查；项目已有必需规则全部保留。N/A、空 Pack、只有人工看过、普通编译成功或一条不相关测试都不能替代任一 Gate。人工审查可补充机器不能证明的事项，不替代双 Gate。

## 缺少就补建，不跳过

1. Scope/Diagnose 盘点两类现有规则、执行入口、作用范围及证据格式。已有规则足够就按真实版本引用；缺失或覆盖不足时，向父协调器请求相应 Architect / QE 的 **gate-design leaf**，使用 [设计 Prompt](../prompts/gate-design.md)。这属于当前阶段内部任务，不追加完整 Architecture/Quality 阶段。没有可安全并行的资源或槽位时串行 child。
2. Architect 定义实际架构约束，例如真实依赖方向/模块边界/接口兼容性；QE 定义 AC、边界与回归的独立 Oracle。设计不能只是扫描一个关键词、检查文件存在或无断言脚本。每项给出 ID/kind、规则来源、适用范围、blocking、命令/cwd/副作用、成功阈值、失败语义及原始报告；新增脚本/测试仅写 leaf 的 run artifacts 草案。
3. 阶段 child 将两类 Gate 定义及 leaf 证据合入 change.md 或引用其不可变附件，列明 Implement 要新增的项目检查路径、命令和测试；确认两类均有可实现方案才提交 Scope/Diagnose 审批。标准流程在 Architecture/Quality 中定义同样契约。缺工具/权限/可信规则时提出具体补建或授权问题并 blocked，不能标不适用。
4. 获批后 **只有 Implement** 将新检查加入项目，与业务改动一起自测；尽量使用现有工具。增加测试不等于授权安装依赖、改平台分支保护或生产配置；所需新依赖/架构变化按 profiles.md 升级并单独授权。为新 Gate 安排一个受控的失败样例/负向用例，证明违约会失败，再验证真实候选；不能污染工作树或改真实批准 Oracle。若没有新的检查可执行实现，不能提交成“已补建”。
5. Verify 使用新 child 对冻结候选实际执行两类 Gate，不能抄 DEV 自测。若此时发现缺规则/缺实现：缺规则回 scope/diagnose（standard 回 architecture/quality），缺实现回 implement；停止并保留已有证据，不在 Verify 写项目检查或临时发明宽松替代规则。规则/候选变化必须重新审批和验证。

自动批准也不能豁免双 Gate。新增 Gate 必须在原 change 与授权卡中明确，覆盖写路径、命令和副作用；缺授权转人工。尚未安装的入口可在卡中绑定已审阅的 run 草案路径/摘要及计划安装路径，Implement 原样安装后核验真实摘要再执行；草案变更需要重新授权。不是允许自动运行未知脚本。

对应 authorization 的 allowed_commands.entrypoint_refs 可用 {path,sha256,install_path}：path 是获批不可变脚本草案，install_path 是批准的项目目标；首次执行前必须核对目标实际字节与已批准 sha256 一致。该安装是批准计划内的补建，不是执行入口的未授权替换；其他入口/副作用变化仍需新授权。

## 证据与完成

正文仍只需 change.md / verification.md，不强制短流程额外写两份设计报告或 Fitness JSON；**定义、可执行检查和双 Gate 结果不可省略**。catalog.gates 是所有 profile 共享契约，profile.output_overrides 只覆盖正文，不能覆盖 gate 证据。

Verify 在本 run evidence 写 `architecture-gate.json`、`quality-gate.json`，使用 [Gate 结果模板](../templates/work/gate-result.json)。每份填 kind、候选 scope/真实文件摘要、批准规则 baseline_refs、执行时间、checks、总状态；每个 check 含 id、blocking/advisory、command/cwd、实际结果/退出码、executed_count/skipped_count、成功判据和 raw_evidence 路径/摘要。保留 stdout/stderr 与工具原始报告。总 PASS 需要非零真实 blocking 检查且全部必需检查通过；失败、零检查、全跳过、未知、无报告、漂移都阻塞。

两份结果必须指向同一完整冻结候选、各自批准规则及真实执行，纳入 result.evidence 和 review.gate_evidence 的 {kind,path,sha256}；verification.md 分别列 Architecture / Quality 结论与链接。父协调器核对报告内容和原始输出，不只信 JSON 的 PASS。必需 AC 和人工补充证据也齐全后才可提交 Verify 批准。双 Gate 可以按 orchestration 隔离资源并行；等待两者收齐才汇合。

CI 接入仍须在业务项目中实现真实检查和 required checks；没有 CI 不豁免本地双 Gate。方法包不会自动安装通用 Gate 引擎，也不把写出 JSON 当作真实执行。
