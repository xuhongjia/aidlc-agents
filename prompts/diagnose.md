# Diagnose · 先定位，再授权修复

组合工作（dispatch.workflow_ref 非空）先遵守 `.aidlc/system/prompts/composed-stage.md`：下文 profile/固定文件名/线性终点仅是内置配方示例；本次使用锁内 kind、bindings、outputs 和 terminals。原有职责、事实证据、AC/Oracle 与双 Gate 保证不变，不因模板改名省略。

按 `.aidlc/system/workflow/knowledge.md` 核对既有排障/反模式经验的适用性；不能用旧 PASS 代替本次复现。change 的 AC 表逐项映射来源 FR/NFR 或明确排除理由。

执行 common，核对 profile=fix，按 workflow/profiles.md 检查适用性。只调查/复现，不修业务代码。

以可信预期与实际行为建立最小复现，记录命令、环境、候选/版本和原始失败证据；区分事实与根因假设。需要额外权限/生产数据/副作用时先停止询问。没有可验证复现或根因未确认就 blocked，不能以“可能是”批准代码修复。

按 workflow/gates.md 盘点 Architecture / Quality 双 Gate，缺少就请求父协调器派发 Architect/QE gate-design leaf，纳入最小修复计划。复现用例不能自动同时算作架构 Gate；两类需分别有相关断言与执行证据。脚本草案只写 run，批准后由 Implement 补建。

用 `templates/compact/change.md` 记录根因、最小修复范围、AC、回归 Oracle、修复前后证据要求、邻近行为回归、检查和回滚。新增测试仅作为 run 附件，获批 Implement 才安装。高风险缺陷同样升级 standard；禁止把 bug 标签当低风险证明。只返回父协调器，不自己批准或直接修复。
