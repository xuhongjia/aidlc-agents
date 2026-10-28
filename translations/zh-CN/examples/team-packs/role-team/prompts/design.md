# 技术设计 · 单一正文与可执行计划

基于批准 spec、共享 Test Design 和真实代码，在 technical-spec.md 定义方案、模块/依赖边界、API/数据契约、安全/兼容性、回滚及取舍。链接 Jira Story/AC 和固定源摘要，技术正文留工程仓库。只为当前切片设计，不复制整份 PRD。

按 gate-design 协议定义两类真实 Fitness；缺失检查须明确交 Implement 安装并证明负向有效。quality-design.json 引用原 QA 用例基线，补测试层次、Oracle、数据/环境、验收与脚本映射；coverage.json 覆盖全部 AC。不得用文件存在或恒真脚本替代架构/行为检查。

implementation-plan.json 保存可独立验证的纵向小任务、Requirement/AC/Case、完成判据、依赖、独占写入路径、命令、回滚和集成检查；只有资源独立且实际有益才并行。声明技术 Spec 的受版本管理路径，供 Implement 原样落库；本阶段仍只写自己的 artifacts。业务可读子任务摘要供父同步 Jira，技术细节留仓库。

技术负责人确认架构/计划，QA 确认质量设计与新增技术断言。既有 QA 批准不覆盖新的 Oracle；改变业务行为须退回 PO。全部对应批准齐备后才向 Implement 授权。本节点只设计，不编写或执行 TDD；需专门设计 leaf 时向父请求，不自行 spawn。
