# 独立节点信封

任务只给 project_root、dispatch_path、result_path；在真实新隔离 child 中执行，不继承父聊天。

先读 dispatch。schema 4 用宿主工具核验完整锁摘要，定向提取本节点、定义、相关依赖/资产/授权绑定；不回传整份锁。核对 instruction_refs 的完整性及每项真实字节摘要，再读其中的固定 worker 契约、角色、当前 Prompt、条件协议和模板。名单由锁内 context 契约、kind/capabilities/输出语义及团队传递依赖推导，不是父 Agent 自由删减；缺映射或必读项即 blocked。

按 worker 契约读取真实请求、批准基线及证据，执行单节点并返回 result。已读信封不递归加载；不加载线性阶段 Skill。团队确有必要的额外规则仍按锁定引用读取并单列预算，不因节省 tokens 删除。

旧 dispatch 使用其原方法与冻结资产，不套精简名单；原文件不足则 blocked，不从活动安装补齐旧规则。
