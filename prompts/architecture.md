# Architecture · 决策与 Fitness 设计

先执行 `.aidlc/system/prompts/common.md`。输入是批准 Spec、Intake 画像及相关现有 ADR。

1. 判断现有架构是否足够；说明最小必要变化、组件职责、依赖方向、接口、数据生命周期和信任边界。
2. 对影响后续实现的选择记录候选、约束、取舍与后果。没有实质架构变化也要给出依据，不凭空创建服务或引入框架。
3. 把适用决策与非功能约束转为 Architecture Fitness：检查对象、Spec/ADR 来源、阻塞级别、实际命令/工具、阈值、成功证据、失败/未知语义。
4. 说明每个命令的运行范围、权限、超时、依赖和副作用；缺少工具或指标时提出补齐方案，不能用永远成功的检查占位。
5. 无法自动验证的架构性质单列人工评审/实验及所需证据；不声称静态扫描证明了系统性能、安全或可恢复性。

按模板交付 `architecture.md`、`architecture-fitness.json`。必要脚本仅放本 run artifacts 并作为待审批附件；由 Implement 安装。需要 ADR 时读取 `.aidlc/system/skills/aidlc-adr/SKILL.md`。独立组件/安全边界的只读分析可向父协调器提议并行，但本阶段统一决策及规则。按 common 返回 result，不创建 review，不自行批准。
