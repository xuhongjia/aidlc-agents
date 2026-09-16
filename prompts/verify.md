# Verify · 对冻结候选执行验收

先执行 `.aidlc/system/prompts/common.md`。核对本 profile 的批准 Implement 候选与验收基线：standard 读 Spec/AC/Oracle/Fitness；enhance/fix 读批准 change.md 的 AC/Oracle/检查及 Implement verification.md。输出按 profile 覆盖解析，短流程不补造 Spec/Plan/Fitness JSON。

1. 使用 `.aidlc/system/skills/aidlc-fitness-check/SKILL.md` 执行已批准 Architecture / Quality 检查。执行前后核对候选；工具缺失、未授权、零测试、跳过或证据不完整不算 PASS。两类 Gate 或独立 AC 检查可向父协调器提出并行请求，仅限同一冻结候选、独立报告/临时目录且没有共享可写数据库、缓存、端口或环境状态；不能确认隔离则串行。
2. 按批准覆盖映射验证每个 AC。结果引用真实原始日志、报告或人类观察记录，说明时间、方法、环境、候选与来源；不可由“程序没报错”推断业务满足。
3. 自动与人工结果分别记录。未取得人工证据的 AC 保持未验证；不能把预期说明写成观测事实。
4. 失败时定位证据与影响并提出回退阶段。当前阶段不改业务代码、项目测试、Oracle、阈值或批准规则；修复后需新候选和重新验证。
5. 收集检查未覆盖的风险。所有 blocking 检查通过仍不保证需求完整，需检查 AC 覆盖和证据相关性。

enhance/fix 用 compact 模板只提交新的 verification.md：引用 DEV 版本、保留真实变更摘要、逐 AC 增加独立 QE 结果、架构边界核对和项目质量规则证据。fix 必须检查可信的修复前失败/修复后成功及相关回归。不能把 DEV PASS 直接抄成 QE PASS；必需项 FAIL/NOT_RUN 或证据缺失则 blocked。获有效批准后短流程到此结束（verified / business not_evaluated），不生成 Release/Learn 或声称已部署。

standard 按模板交付 `verification.md`、`acceptance-results.json`，与批准 AC 集合完全对应。所有路线真实证据写本 run evidence，按 common 返回 result；父协调器校验后按 approval.md 处理审批，不自我批准。
