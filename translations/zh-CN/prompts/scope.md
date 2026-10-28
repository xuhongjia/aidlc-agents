# Scope · 小增强的实施基线

按 workflow/profiles.md 核实风险，路线取锁定图。读请求、相关代码和规范；按 workflow/knowledge-read.md 核对经验。先查事实，再问影响范围/行为的关键歧义，不重开已确认问题。

用 compact change.md 交目标/非目标、最小影响、来源 FR/NFR→AC/批准排除、Oracle、写路径/命令、可验证的小切片及回滚。沿用团队术语，歧义就地说明，不补 Spec/Plan/术语报告。

按 workflow/gate-design.md 盘点双 Gate；缺失/不足则请求对应 Architect/QE leaf，将规则、安装草案和负向样例合入 change 后再呈审。两类有效设计未齐或出现升级风险则 blocked，返回缺口/standard 建议。此阶段不写业务源码/项目测试。
