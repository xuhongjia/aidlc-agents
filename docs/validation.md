# 本版验证记录

版本：`0.2.0`。验证日期：2026-09-16。对象是 AI-native 指令包，不是此前的可执行原型。

## 已完成

| 检查 | 结果 | 能说明什么 |
|---|---|---|
| 包一致性测试 | 8 项通过 | manifest/payload、阶段引用、JSON、14 个 Skill、文档链接、bridge、发布内容和维护者 CI 配置满足当前静态规则 |
| Skill 格式校验 | 14 个通过 | 指令文件格式和基础元数据有效，不代表模型一定正确执行 |
| 独立 README 读者测试 | 8 个使用问题均能回答 | 读者能找到接入、审批、恢复、权限和验证边界；发现的 3 处措辞歧义已修正 |
| AI 实际 setup | 通过 | 独立 AI 按 bootstrap，在带已有规则和业务文件的隔离项目中完成本地副本接入 |
| 重复 setup | 通过 | `already-installed`；全部 75 个文件的摘要及修改时间不变，无重复 marker 或状态重置 |

维护者复现内容检查：

```sh
node --test tests/*.test.mjs
```

这是包维护者的静态检查，不是安装依赖，也不是使用者业务仓库的质量门禁。

## 实际接入测试的范围

- 来源为明确指定的 `local-unreleased` 副本，版本 `0.2.0`、`revision=null`，不是远程发布版。
- 测试执行者使用 Codex 的文件和终端能力；没有 Python、安装脚本、依赖安装、另一套 Agent CLI 或常驻服务。
- 原样复制 70 个 payload 文件；71 个受管文件（含 Codex bridge）的真实 SHA-256 均匹配。
- 配置中记录来源文件清单、实际摘要、工具和安装时间；保留已有 AGENTS 原文、README 和业务代码。
- 显式读取 canonical router/protocol，并正确解析 Intake 的 BA/PO 责任、阶段 Prompt、两个产物及人工审批点。
- 未创建需求、阶段批准或业务改动；未安装可选原生 Skill；未 commit、push、部署或改变 CI。

该接入测试的来源清单摘要为 `24db12da0d1b81d9f6a2039b80fda741465dd2ab10143c8af925a1c60c4edf61`。它标识测试时的本地快照，不是发布 commit；之后仅修正文档中的网络授权、setup/演练边界、Quality 返工措辞，并补充本验证记录。最终包需继续通过内容检查，不将这些文档修订冒充重新完成了接入测试。

## 尚未验证

- GitHub 在线 bootstrap 发布及下载路径；用户推送后才可验证。
- Codex 原生自动发现，以及 Claude Code、Cursor、Copilot 的客户端端到端接入。
- 一条真实业务需求从 Intake 到 Learn 的全链路、批准后推进、返工和漂移阻断行为。
- 业务项目 Architecture/Quality Fitness 的真实执行、CI 强制门禁、分支保护或平台身份审批。
- 本仓库 GitHub Actions 的远程运行结果；本次仅本地运行同一内容测试。

不将包格式检查等同于业务需求验收，不将本地副本接入等同于 GitHub 在线下载已发布，不将一个工具的试用等同于所有工具兼容。Prompt 和本地记录不能提供不可绕过的权限或防篡改保证。
