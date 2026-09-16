# 自动解析审批人

父协调器在创建工作、展示批准/委托卡及记录决定前，按顺序只读解析：**当前需求绑定 Jira 的经办人 → 当前业务仓库有效 Git user.name/user.email → 当前系统登录人**。不要求用户重复填写可获取的信息；获取姓名不等于取得批准。

## 来源与回退

1. **Jira**：只有工作已明确绑定唯一 issue 时，使用当前可用且获准的连接读取它的 assignee，保存 issue key、稳定账户 ID、显示名和接口实际返回的 email。邮箱被隐藏就 null，不猜测、不用 Git 邮箱拼成另一人的身份。仅安装了 Jira 插件不算绑定；多个 issue/不同经办人时询问本工作的审批 issue，不任选一个。没有 issue 或确实 unassigned 时记录原因并回退 Git；绑定 issue 但访问失败/权限不足时身份保持待确认，不静默改用本地用户代替指定经办人。
2. **Git**：在业务仓库根分别只读执行 `git config --get user.name` 和 `git config --get user.email`，读取该仓库实际生效的配置，记录来源与时间。不取最近提交作者，不修改 local/global config。任一真实非空字段可保留，缺字段为 null；两项都没有或不在 Git 仓库才回退系统。命令执行失败与字段缺失分开报告。
3. **系统**：使用宿主提供的登录身份或系统原生只读接口。Unix 可读取 logname；macOS 无终端登录记录时可核对控制台登录用户；Windows 使用实际登录会话账户。不从文件夹路径、机器名或 Git 历史猜人。id/whoami 只证明进程身份，不能把 root、服务账号、sudo 账户当交互登录人；只能取到这种身份时先确认。系统未提供邮箱时 email=null，不拼造地址。

按 [身份模板](../templates/work/approver.json) 保存 state.approver；review.approver、approval.approver 和自动策略 approver 保存各自当时的快照。记录 source/source_ref/resolved_at，resolution_notes 说明缺失、回退或待确认原因；不要把完整用户目录、令牌或其他 Jira 字段存入证据。所有来源均不可用才询问一次，保持 pending，不伪造身份。

## 审批归属与变化

卡上直接显示解析出的审批人及来源。Git/系统身份是本地默认署名；在该卡已显示身份、当前用户明确批准该版本且无身份冲突时，manual 的 by 直接使用解析值（有姓名和邮箱时 `姓名 <邮箱>`），不再多问一次姓名。原话、时间和来源仍必须记录；凭 Git 配置本身不能生成批准。

status=resolved 只表示成功取得身份，pending 表示需确认。比较身份变化时使用 source/source_ref/account_id/display_name/email，不把刷新时间本身当成改派。缺姓名时可用真实邮箱或系统账号作显示值，不编造姓名；审批模板的 decision_source 保存可追溯原回应来源，delegation_ref 只在真实代批授权存在时填入其证据路径/摘要。

Jira 经办人不是当前聊天者的身份证明。经办人与回应者不一致或无法关联时，保留预期经办人，等待其真实批准，或当前用户明确声明/提供可追溯代批授权；记录实际回应者及授权依据，不能把本地“同意”直接署给 Jira 的另一人。不自动修改 Jira 经办人、评论、状态或平台审批。

自动批准始终 by=parent-coordinator、user_statement=null；approver 记录责任人，policy.authorization.by 记录实际授权者，并绑定确认卡；只有责任人本人或明确获授权代理的真实委托可激活策略。自动读取身份不能构成委托。

在待审批/自动推进前刷新身份；若 Jira 改派、Git/登录身份变化或来源不可再确认，暂停新批准和自动继续，按 approval.md 撤销当前自动策略，展示差异并确认后使用新快照。旧 review/approval/policy 不改写、不补签；更换待审卡身份需新 review revision。已完成的历史批准保留当时身份，后续变更不伪造追溯签字。本地记录不是认证系统，强身份及职责分离仍由项目平台实施。
