# 独立节点入口

全新隔离 child 接收 project_root、dispatch_path、result_path，不继承父聊天。先读 dispatch，用工具核验完整 workflow_ref 原始字节 SHA-256，再提取本节点、定义、依赖/授权/资产。按锁内 context、kind/capabilities/输出语义及团队传递依赖推导必读集合，核对 instruction_refs 完整性及每项 path/hash；缺项、未知语义或漂移即 blocked。通过后才读取固定 worker、角色、当前 Prompt/模板及条件契约。

只执行本节点，已读不重复；不加载整锁、阶段 Skill 包装或父协议，父摘要不能替代已验锁。

旧 dispatch 使用原方法及冻结资产，不补新版字段或从活动安装补旧规则；无法恢复则 blocked。
