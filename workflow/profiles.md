# 按风险选配方

此文件只定义选型与正文。父协调器负责归一化、调度、审批和原版本恢复；child 核实当前风险，不加载父协议或自行改图。

| 配方 | 适用 | 阶段 | 实施授权 |
|---|---|---|---|
| fix | 局部可复现，恢复明确既有行为 | diagnose → implement → verify | 获批根因、范围、Oracle 与计划 |
| enhance | 原边界内、可独立验收回滚的小增强 | scope → implement → verify | 获批范围、AC、Oracle 与计划 |
| standard | 新能力或高风险 | intake → spec → architecture → quality → plan → implement → verify | 获批 Plan 及设计基线 |

config.workflow/profile 是偏好，不是权限。auto 按上表初选；用户选择优先但风险冲突先确认。意图不清只问改变路线的关键问题，不在父上下文诊断。只组合已注册阶段；首个只读 child 核实，首卡确认图和范围。

## 强制升级条件

身份/权限/信任边界；支付、敏感数据/合规；schema/数据迁移；破坏性 API/事件/数据契约；新服务/依赖/基础设施/IAM/部署策略；跨系统或广泛重构；影响或回滚无法界定。

任一项即 blocked，返回证据和 standard 或同等保障的人审团队图建议，不因 bug 标签/代码少豁免。父先停止旧 run、保留旧图，确认新图后重新派发；不复用旧批准。根因未确认可继续授权调查，但不能批准修复。

## 精简产物

fix/enhance 仅 change.md、verification.md 两类正文，技术附件/批准历史保留。change 含范围、FR/NFR→AC/批准排除、Oracle、架构影响、双 Gate、实施边界/切片/回滚；fix 加真实复现/根因。verification 分清 DEV 自测与独立验证，不能覆盖旧批准。

背景引用既有基线，只写差异/决定/风险，无关章节省略；风险不因“一页”被截掉。standard 保留七阶段的 AC/覆盖/结果契约。所有交付保留真实双 Gate；缺失按已加载 gate-design 补建，Verify 只按 gate-execution 回退，不免除或放宽规则。fix 用同 Oracle 证明修复前失败、修复后通过及邻近回归；草案留 run，获批 Implement 才安装。

默认每阶段人审；checkpoint/auto 由父按有效委托处理，child 不自批。默认终点是 verified/business not_evaluated，不强制 Release/Learn；团队显式发布链及旧工作按原锁。
