# 按风险选配方，按语义交付

这是选型与正文规则，不是第二套调度器。内置配方按 [extensions](extensions.md) 归一化后与团队图统一走 [dag](dag.md)；已有工作按 [原版本兼容](legacy.md) 恢复。

| 配方 | 适用 | 阶段 | 实施授权 | 正文 |
|---|---|---|---|---|
| fix | 局部、可复现、恢复明确既有行为 | diagnose → implement → verify | 已批准根因、范围、Oracle 与计划 | change.md、verification.md |
| enhance | 原边界内、可独立验收回滚的小增强 | scope → implement → verify | 已批准范围、AC、Oracle 与计划 | change.md、verification.md |
| standard | 新能力或高风险 | intake → spec → architecture → quality → plan → implement → verify → release → learn | 已批准 Plan 及其设计基线 | 各阶段必要产物 |

config.workflow/profile 是偏好不是权限；用户明确选择优先，但冲突先确认，风险不能豁免。auto 下恢复既有行为先 fix，小增强先 enhance，新能力/明显高风险先 standard；意图不清先问关键问题，不在父上下文诊断。AI 可组合已注册阶段，不在交付时发明新职责/模板。首只读 child 核实初选，首卡一并确认图与范围。

## 必须升级的风险

身份/权限/信任边界；支付、敏感数据或合规；schema/数据迁移；破坏性公共 API/事件/数据契约；新服务/依赖/基础设施/IAM/部署策略；跨系统或广泛重构；影响或回滚无法界定。任何一项都不能用 bug 标签、少量代码或催促抵消。

发现这些因素立即 blocked，返回理由和 standard 或同等保障的人审团队图建议。停止/收齐旧 run，保留旧图和结果；确认新图后新 entry/run，不复用旧批准，不静默降级或换轨。根因未确认但能调查时保持 diagnose blocked 并提问。

## 精简正文

- change 合并范围、来源 FR/NFR→AC/批准排除、Oracle、架构影响、双 Gate 定义、写路径/命令、实施计划和回滚；fix 再加真实复现与根因。
- verification 分清 DEV 自测、独立 QE 结果和候选；批准版不可覆盖。短流程不再新增 Spec/Plan/ADR/追踪报告，技术附件与历史证据仍保留。
- 背景引用现有基线，正文只写差异、决定和风险；无关章节省略，风险不因“一页”被截掉。standard 的 AC/覆盖/结果 JSON 契约保留，九阶段顺序不变。
- 所有交付仍要两类真实 Gate；缺规则按 [gates](gates.md) 补建，不能人工替代、删测试或降阈值。
- fix 在同一批准 Oracle 下证明修复前失败、修复后通过及邻近回归，不回滚用户树、不改名绕过。诊断阶段测试草案只写 run，只有获批 Implement 安装。

默认三阶段各有人审；明确授权 [checkpoint](approval.md) 后为三阶段两次人审。内部有限自纠错见 [implementation-feedback](implementation-feedback.md)，不是跨阶段自动返工。Verify 批准后短流程为 verified/business not_evaluated，不强制 Release/Learn；standard 的完成与业务接受按 protocol 分别报告。
