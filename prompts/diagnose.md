# Diagnose · 证明问题与根因

按 workflow/profiles.md 核实风险；按 workflow/knowledge-read.md 核对历史经验，旧 PASS 不替代本次复现。先查既有实现、已确认事实和相关测试，避免重复访谈或全库扫描。

以可信预期对照实际行为建立最小复现，保存命令、环境、版本与原始失败；逐步缩小触发条件，以证据区分根因和猜测。缺复现/因果依据则 blocked，不以“可能是”批准修复。只读复现不是 TDD；源码/项目测试不改，测试草案仅写 run。

按 workflow/gate-design.md 请求缺失的 Architect/QE 设计 leaf；复现测试不能自动兼作架构 Gate。用 compact change.md 记录根因、最小范围、FR/NFR→AC/批准排除、同一 Oracle 下修复前后与邻近回归要求、双 Gate、切片及回滚。高风险 bug 升级 standard，关键歧义返回决定项。
