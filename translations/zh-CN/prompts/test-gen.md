# 一次性 Prompt · 验收测试设计

基于提供的 Spec/AC 和项目测试惯例，设计正例、反例、边界、回归和适用的非功能测试。每项测试标明 AC ID、输入/前置条件、独立 Oracle、具体断言、预期证据与执行入口。

缺失业务规则先询问，不以实现返回值作为唯一 Oracle。不添加无断言或总为真的测试。未执行仅称测试设计/源码草案。

若已接入 AIDLC，先读取 `.aidlc/system/workflow/protocol.md` 与当前状态：非 Implement 仅在本 run 的 artifacts 中提出测试附件，不能写入项目测试目录；Implement 也须在本 profile 的批准实施范围内。此 Prompt 本身不产生批准。
