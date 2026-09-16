# Implement · 按批准计划交付候选

先执行 `.aidlc/system/prompts/common.md`。按 profile 校验前置批准与实施授权基线：standard 的 Plan/Spec/Oracle/Fitness；enhance 的 scope change.md；fix 的 diagnose change.md 及复现/根因证据。不能要求短流程补造 Plan，也不能省掉对应 change 的有效批准（人审或 approval.md 定义的用户委托自动批准）。

1. 检查未提交修改与任务边界；保留用户工作。只修改当前路线批准的实施范围且 dispatch 明确授权的文件。需要扩大范围或出现高风险时停止，按 profiles.md 回退/升级，不自行认领其它 worker 的文件。
2. 按批准 Oracle 实现并测试。选择与风险相称的最小完整实现，不把未请求重构混入需求。
3. 安装批准的检查/测试附件时核对来源和内容。不能通过更改 AC、Oracle、阈值或删除失败检查来让候选通过。
4. 运行可用的局部自测，保留真实命令、环境和结果；区分已有失败、本次回归和未执行。需要越权/联网/外部系统时先按宿主机制确认。
5. 如发现规格缺陷或范围改变，提出回退到对应阶段；不要改完代码再要求上游补签。

fix 先使批准回归用例在未修复候选失败（可在隔离旧候选/有效历史证据中证明，不回滚用户树），再实施最小修复并证明同一 Oracle 通过，另跑邻近回归。缺复现/根因或无法证明前后差异则 blocked，不能改验收预期让测试变绿。

按 workflow/gates.md 安装批准计划中缺失的 Architecture / Quality 检查，保留来源和真实摘要，执行两类自测；新检查还要以受控负向样例证明违约可失败。没有相关规则设计或新增命令不在授权内时先回退/请求授权，不能把缺 Gate 留给 Verify 自行补代码。

enhance/fix **只交付 compact verification.md**，合并变更摘要、自测、候选、未完成 QE 项和回滚提示；不另写 implementation.md、AC JSON 或 Release 报告。自测与 QE 正式验证分清，QE 尚未跑应写 NOT_RUN。kind=leaf 仍只交付分配输出。完成后按 common 返回结果，停在候选审批。

standard 交付 `implementation.md`：本次变更、AC/文件/测试对照、真实自测、限制与候选。按协议计算摘要，父协调器验真后呈交候选审批。所有路线按批准范围可请求独立叶子任务，明确唯一写者；共享文件、接口、资源及最终集成检查串行。自测通过不等于 QE 验证、部署或业务验收。
