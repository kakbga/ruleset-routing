# ruleset-routing

个人分流规则与客户端配置集合，提供 **Clash Verge Rev / Mihomo** 和 **Quantumult X** 配置，并附带 Clash Verge Rev 的主题样式与脚本。

> 配置中的规则集和部分资源由上游项目提供。使用前请检查配置内容，并替换为自己的节点或订阅信息。

## 仓库结构

```text
.
├── clash-verge-rev/
│   ├── config/clash-verge.yaml      # Mihomo 主配置
│   ├── ruleset/                     # 本地规则文件
│   ├── scripts/clash-latest.js      # Mihomo 配置脚本
│   ├── theme/                       # Clash Verge Rev CSS 主题
│   └── image/                       # 主题配图
└── quantumultx/
    └── QuantumultX.conf         # Quantumult X 配置
```

## Clash Verge Rev / Mihomo

配置文件：[`clash-verge-rev/config/clash-verge.yaml`](clash-verge-rev/config/clash-verge.yaml)

配置包含 DNS、代理提供者、策略组和规则提供者。策略组按用途和节点地区组织，包括全球加速、苹果服务、AI、流媒体、Telegram、广告拦截与隐私保护等。

### 使用

1. 安装并打开 Clash Verge Rev。
2. 在配置文件中找到 `proxy-providers` 下的 `airport`。
3. 按需选择本地节点文件，或取消注释 HTTP 订阅配置并填入自己的订阅地址。
4. 确认节点名称能匹配配置里的地区筛选条件；必要时调整筛选表达式和策略组。
5. 将配置导入 Clash Verge Rev，并检查规则和节点是否正常加载。

配置引用了 Blackmatrix7 的规则列表，并使用多个远程规则提供者。远程规则需要网络连接，更新频率由配置中的规则提供者设置。

### 本地规则

`clash-verge-rev/ruleset/` 当前包含：

- `AI.yaml`
- `applications.yaml`

如需扩展规则，请按 Mihomo 规则集格式编辑对应文件，并确认主配置中的引用路径与文件名一致。

## Quantumult X

配置文件：[`quantumultx/QuantumultX.conf`](quantumultx/QuantumultX.conf)

配置包含 DNS、策略组、远程分流规则、重写资源、脚本任务和本地规则。策略组按地区和用途划分；远程过滤规则来自 RuleGo 等上游项目。

### 使用

1. 在 Quantumult X 中导入 `QuantumultX.conf`。
2. 添加或配置自己的服务器节点，并确认策略组引用的节点名称与实际节点相符。
3. 检查远程规则、重写资源和脚本任务是否按需启用。
4. 根据自己的网络环境调整 DNS、MITM 主机名及其他本地选项。

MITM 相关重写功能需要在 Quantumult X 中按应用要求安装证书并启用 MITM。启用前请确认理解其影响，并仅保留自己需要的主机名和重写项。

## Clash Verge Rev 主题与脚本

- `clash-verge-rev/theme/theme.css` 和 `thematic.css`：主题样式文件。
- `clash-verge-rev/image/`：主题使用的图片资源。
- `clash-verge-rev/scripts/clash-latest.js`：Mihomo 配置脚本。

请在 Clash Verge Rev 对应的主题或脚本设置中使用这些文件，并按客户端版本及个人偏好调整。仓库内的 `clash-verge-rev/README.md` 还记录了主题背景图的自定义方法。

## 上游来源

仓库配置引用的规则、图标和脚本来自各自文件中标注的远程地址，例如：

- [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script)
- [ConnersHua/RuleGo](https://github.com/ConnersHua/RuleGo)
- [Orz-3/mini](https://github.com/Orz-3/mini)
- [KOP-XIAO/QuantumultX](https://github.com/KOP-XIAO/QuantumultX)

上游资源可能更新或调整。遇到规则失效时，请先检查对应远程地址及上游项目说明。

## 免责声明

本仓库配置仅供个人学习和参考。请根据所在地区法律法规、客户端文档及自身需求使用，并自行检查第三方规则与脚本的内容。

