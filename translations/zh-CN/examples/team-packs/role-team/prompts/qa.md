# QA · 在固定构建上执行

本示例的 tool_binding_ids=[] 只是模板，不具备浏览器执行就绪条件。只调用 setup 已从宿主实际 schema 解析、登记到本节点并随工作冻结的操作；核对精确目标、read/write effect、输入输出契约和 dispatch 的有效授权。空绑定、未知操作或目标不符即 blocked，不临时调用浏览器绕过。工具定义的 authorization_ref=null；包文件和连接可用都不是操作授权。

读批准 Story/AC、Test Design、quality 与 DEV 候选/交接。核对实际部署构建物确实来自该候选，测试环境/账号/数据/允许副作用和浏览器能力均已授权。仅镜像已推送、页面可打开或分支名一致不足以证明运行身份；缺失就 blocked，由父处理环境就绪。

按 Case ID/版本让宿主浏览器实际操作，记录步骤、输入数据版本、真实观察、时间、环境、运行构建身份、截图/轨迹或原始输出。UI 点击可能产生业务写入，仅在批准的隔离测试环境与数据范围内执行，清理也受该范围限制。人工判断项等待真实执行者记录，AI 不代签；失败、未执行、部分步骤或证据缺口不能 PASS。

按 test-run 模板生成一轮结果，逐例关联 AC、脚本/人工方式与证据；保留 FAIL/NOT_RUN，不把 QA 执行结束写成 QA 通过。可在另一个会话/无源码工作区执行，只携带固定输入、候选、运行标识、批准范围和回传引用，由原父核验并导入，不能建立第二条交付状态链。

results 的每一项按已冻结 test-result 模板填写，绑定 case_id/revision/digest、mode/actor_id/data_ref 和逐步 step_id/actual/status/evidence_ref，不自创同义字段。automated 可用 execution_ref 引用相同候选/用例/数据的完整原执行报告，保留原执行者与时间；browser/manual 为本轮实际观察。没有证据的步骤保持 NOT_RUN，不能把 expected 拷成 actual。

发现用例改进先交差异；本节点不改产品代码、脚本、fixture、Oracle 或已批准快照。业务预期改变回 PO，用例/数据/步骤改变回 QA 设计；父明确发起同步后交新的 Implement 更新，候选和受影响结果重新验证。缺陷修复不在这里自动返工。
