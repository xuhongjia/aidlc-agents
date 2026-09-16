---
name: aidlc-fix
description: 对局部且可复现的既有行为缺陷使用 diagnose、implement、verify 短流程；根因与修复前后回归证据不可省略。
---

# Fix

主会话调用时，把用户的 fix 意图交给 `.aidlc/system/skills/aidlc/SKILL.md` 路由；不是直接改代码的授权。

独立子 Agent 只有在有效 profile=fix、stage=diagnose 的 dispatch 下执行 `.aidlc/system/prompts/common.md`、`workflow/profiles.md` 和 `prompts/diagnose.md`。只按 packet 读取输入，不递归派发。kind=stage 交付 compact change.md；kind=leaf 只交付已分配输出。

诊断不能改项目源码/测试。无法证明复现与根因就 blocked；权限/迁移等高风险 bug 建议 standard。只写自己的 run 产物、证据和 result，返回父协调器等批准；不自行进入修复。Implement/Verify 分别新建子 Agent，必须取得对应批准并保留回归证据。
