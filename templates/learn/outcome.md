# Outcome & Learning

AIDLC_DRAFT — 有真实交付/业务观察后填写并替换本标志；测试绿灯或离线示例不是业务收益证据。

## 观察身份

记录实际候选/镜像 digest、环境、观察窗口、来源和反馈者，引用自动检索的 source-index.json。按批准目标区分 UAT 和生产观察；若所需环境/版本或证据无法确认，保持 inconclusive。

## 需求结果

| 原始目标/验收 | 实际观察 | 来源证据 | 与预期差异 |
|---|---|---|---|

Jira 反馈保留 issue/comment ID、作者、必要原文、发生/更新时间、链接与候选关联依据；同时保留支持与反对意见。Done/Resolved、fixVersion 或一次构建成功不能代替业务反馈。

## 结果判定

`outcome.json` 的 `result` 使用 `accepted`、`rejected` 或 `inconclusive`；`observed_at` 使用实际带时区时间，`evidence` 引用真实证据。结论须由真实用户反馈或约定的观察证明，不从 Gate PASS 推断业务接受。无证据时保留 `null`/空数组并 `blocked`。

## 学习与后续建议

记录返工、漏测、无效/有效 Fitness 和协作问题。没有前后基线不计算提效收益；改进建议不自动构成新的实施授权。拒绝结果可以结束本轮观察，但不等于需求成功完成。

如结果不足，给出具体来源/权限/观察缺口；审批人可直接终结当前工作，记录 closed 并保留实际业务结果，无需补造反馈或继续剩余阶段。
