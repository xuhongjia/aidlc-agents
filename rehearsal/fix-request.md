# FIX-001 · 人工审批演练输入

在隔离任务清单 CLI 仓库修复“搜索无结果却显示 total=1”。使用 fix 路线；仅进入 Diagnose，等待我批准精确 review 后再实施。不得替我批准、开启自动模式、提交或推送。

- FR-1：搜索不存在的词返回 items=[]、total=0。
- FR-2：有匹配时 total 等于返回条数；大小写不敏感。
- NFR-1：不传 search 的既有行为与原始顺序保持兼容；空数据总数为 0。
- NFR-2：domain 不依赖 CLI、文件系统/网络或 adapter；Architecture Gate 缺失需 Architect leaf 设计，批准后 Implement 安装并证明违约负样例失败。Quality Gate 必须真实测试业务行为。

数据只使用随附人工样例，无公司系统。复现命令：`node src/cli.mjs --file data/tasks.json --search missing`。复现失败、修复前测试失败、修复后通过及独立 Verify 的证据分开保留。
