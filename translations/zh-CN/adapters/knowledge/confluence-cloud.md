# Confluence Cloud · 单向项目知识发布

0.11 新接入通过 TWG CLI（transport=twg_cli）；先用实际 live help 发现命令/schema、格式指南及空间规则，不猜 CLI 参数或将 REST 字段直接传给 CLI。缺 CLI/认证记录 pending，指向知识 setup Skill；Hook 不安装、登录或升级。旧 work/快照继续原版本固定适配器；0.11 新工作继承无 transport 的旧配置时先明确接入配置，不回填旧快照/授权，不借重试切换传输或扩大发布范围。无法可靠读取页面正文/版本、限定父页面、带版本更新或读回时，记录 pending 并说明缺的能力，不降级盲写。

本协议参考官方 [Page API](https://developer.atlassian.com/cloud/confluence/rest/v2/api-group-page/)（2026-09-25 核对）：创建可指定 spaceId/parentId/title/body；读取页面正文与版本，更新使用版本信息。具体调用服从已配置 TWG CLI 能力与授权；不自行获取 token 或建立另一条连接。

页面正文按固定顺序渲染快照的身份/来源、适用与失效条件、content.body、非空 design_body、implementation_verification、anti_pattern 与 redactions；没有的章节不制造占位。设计正文不得被摘要替换，验证状态不得提升；来源保留获批引用而不是只给页面标题。此投影规则/版本及实际 payload hash 写入回执证据，防止只投递摘要遗漏完整设计。所有业务文字已在快照冻结，Hook 只做格式转换。

## 定位、所有权与发布

先按知识协议比较所有回执和远端知识 version（不是 Confluence 页面 version）：较新获批知识已发布时旧版本重试 superseded、零写入。每次写前重读 dispatch.authorization_ledger_path 的最新撤销事件；冻结 revocation_refs 不是实时授权来源。

1. target 固定 id/provider/site/space_id/parent_page_id/types；核实 site、父页面属于指定空间且现有授权可访问。只在这个父页面下查找，不全库抓取。明确 site URL 不等于用户授权。
2. 在批准正文内冻结可见身份块 `AIDLC knowledge: project_id / item_id`，以及 version、snapshot 内容引用；不能仅靠标题判归属。快照 SHA-256 放 receipt，不嵌入自身正文产生循环。首次不存在 owned receipt 时，只允许在没有不确定旧 attempt 且可完整核实该父页面子页的情况下创建。分页需读完；搜索暂时无结果不是“肯定不存在”。
3. 既有页面必须有本项目 receipt 映射，identity 匹配、site/space/parent 不变，并与最后核验的正文/标题/版本一致。人类编辑、移动、重命名、未知版本或多个匹配页均 conflict；不覆盖、不删除、不改权限。未知写结果的恢复只可用持久化 attempt、identity、精确固定内容和目标共同核实，不能拿同名他人页面来补成功。
4. 冻结前由阶段 child 读取格式能力并准备可发布正文；纯 Markdown 到 storage/ADF 的确定性转换可由 Hook 做，但记录转换版本与实际发出的 payload hash，保留原始字节。不得改变意义、外链目标或脱敏决定。渲染无法无损表达时停止回到新 review，不能在 Hook 中重写。
5. create：先发现 confluence content create 的 live help，指定知识库 page 类型、精确空间/父页面、批准 title 和确定性 HTML body 文件，不使用默认 live_doc 猜类型。update：confluence content get 读取 full/html、metadata 与当前 snapshotToken，校验上一回执；通过 confluence content update 的 --snapshot-token 与 --body-file/--format html 更新该 page ID，格式指南读取后才用 --ack-body-formats。CLI 不支持乐观并发控制则 pending，不发无保护更新；token 冲突不直接用返回的新 token 重试，不自动合并人工编辑。写前再核对撤销；写后 GET 验证 page ID、父页面/空间、标题、正文、版本和身份。
6. 若服务规范化正文，只允许记录在案、确定性无损的格式归一化后比较；不能用大模型“意思差不多”验收。读回不确定标 unknown，不称 succeeded。409/人工变化为 conflict；超时或连接中断为 unknown，先查后重试，禁止盲目再 create。401/403 不自行申请更高权限。

每目标/调用最多一次 create 或 update；读回不是第二次写入。未确认的写入不得通过改标题、换 parent 或创建替代页面规避幂等。无测试父页面授权时，真实集成必须报告 NOT_RUN。

## TWG 命令发现与输出

使用 twg help describe "confluence content create" / "confluence content update" / "confluence content get"，创建/写正文前读取 twg confluence content body-formats html。空间解析或编辑前按 live help 读取空间 instructions；指令与冻结快照冲突时停止新 review，不能在 Hook 改文。仅用实际 schema 支持的参数，--yes 只消除 CLI 确认，不取代 knowledge_publish 授权。授权范围、固定目标及最新撤销均满足时可直接执行，不逐条问。

优先 stdout_inline/compact；完整正文/原始响应持久化脱敏文件，预览不足时读 output_files，不逐页重复获取同一内容。不从简短摘要判所有权/正文相等。读取和写后核验始终指定批准 site；默认登录站点不替代目标。用户发起配置才可按 [知识接入步骤](../../bootstrap/knowledge.md) 安装/登录。
