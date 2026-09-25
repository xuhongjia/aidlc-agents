# Scope · 小增强的实施前说明

组合工作（dispatch.workflow_ref 非空）先遵守 `.aidlc/system/prompts/composed-stage.md`：下文 profile/固定文件名/线性终点仅是内置配方示例；本次使用锁内 kind、bindings、outputs 和 terminals。原有职责、事实证据、AC/Oracle 与双 Gate 保证不变，不因模板改名省略。

按 `.aidlc/system/workflow/knowledge.md` 检索相关获批知识并核实现状；在 change 的现有 AC 表记录来源 FR/NFR 映射与明确排除理由，不新增追踪报告。

执行 common，核对 profile=enhance，按 workflow/profiles.md 验证路线是否适合。不要改业务文件。

读取请求与相关现状，用 `templates/compact/change.md` 交付一页左右说明：目标/非目标、最小影响、稳定 AC 和 Oracle、具体检查、待改路径、最小步骤、回滚。复用已有项目规范，不另建 Spec/Plan/Fitness 报告。

按 workflow/gates.md 盘点 Architecture / Quality 双 Gate；任一缺失或不足，就向父协调器请求对应 Architect/QE gate-design leaf，汇合其规则与可执行草案，纳入 change 的实施范围并等批准。没有两类有效设计不能提交成已就绪；不以人工检查或短流程免除 Gate。

关键行为不清就提问；出现强制升级因素，返回 blocked 和 standard 建议，不把风险藏在“很小”的描述里。架构边界与适用质量规则应可核对，不能空写不适用。审查通过前不写源码/项目测试。只返回父协调器，由其按 approval.md 处理审批。
