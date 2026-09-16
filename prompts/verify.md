# Verify · 对冻结候选执行验收

先执行 `.aidlc/system/prompts/common.md`。读取批准 Implement 候选、Spec/AC、Quality Oracle 和两类 Fitness；先核对候选与规则摘要。

1. 使用 `.aidlc/system/skills/aidlc-fitness-check/SKILL.md` 执行已批准 Architecture / Quality 检查。执行前后核对候选；工具缺失、未授权、零测试、跳过或证据不完整不算 PASS。
2. 按批准覆盖映射验证每个 AC。结果引用真实原始日志、报告或人类观察记录，说明时间、方法、环境、候选与来源；不可由“程序没报错”推断业务满足。
3. 自动与人工结果分别记录。未取得人工证据的 AC 保持未验证；不能把预期说明写成观测事实。
4. 失败时定位证据与影响并提出回退阶段。当前阶段不改业务代码、项目测试、Oracle、阈值或批准规则；修复后需新候选和重新验证。
5. 收集检查未覆盖的风险。所有 blocking 检查通过仍不保证需求完整，需检查 AC 覆盖和证据相关性。

按模板交付 `verification.md`、`acceptance-results.json`，与批准 AC 集合完全对应。将真实证据按协议纳入 review；有失败/未知/缺失时报告阻塞，不提交虚假通过。完成后交人类审阅并停止。
