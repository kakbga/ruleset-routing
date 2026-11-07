// Clash Verge Rev 全局扩展脚本
// 在订阅页面打开“全局扩展脚本”，粘贴本文件内容并保存。
// 脚本会在每次生成运行配置时设置 DNS、代理组、规则集和分流规则。
// 代理节点由各订阅提供；本脚本保留订阅中的 proxies / proxy-providers。

const icon = {
  proxy: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Proxy.png",
  global: "https://raw.githubusercontent.com/Orz-3/mini/master/Color/Global.png",
  apple: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Apple.png",
  chatgpt: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/ChatGPT.png",
  streamingSE: "https://raw.githubusercontent.com/Orz-3/mini/master/Color/StreamingSE.png",
  streaming: "https://raw.githubusercontent.com/Orz-3/mini/master/Color/Streaming.png",
  telegram: "https://raw.githubusercontent.com/Orz-3/mini/master/Color/Telegram.png",
  final: "https://raw.githubusercontent.com/Orz-3/mini/master/Color/Final.png",
  hk: "https://raw.githubusercontent.com/Orz-3/mini/master/Color/HK.png",
  tw: "https://raw.githubusercontent.com/Orz-3/mini/master/Color/TW.png",
  jp: "https://raw.githubusercontent.com/Orz-3/mini/master/Color/JP.png",
  sg: "https://raw.githubusercontent.com/Orz-3/mini/master/Color/SG.png",
  us: "https://raw.githubusercontent.com/Orz-3/mini/master/Color/US.png",
  adblock: "https://raw.githubusercontent.com/Orz-3/mini/master/Color/Adblock.png",
  privacy: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/AdBlack.png"
};

const regions = ["香港节点", "台湾节点", "日本节点", "狮城节点", "美国节点"];
const regionChoices = ["节点选择", ...regions, "DIRECT"];
const group = (name, type, extra) => ({ name, type, ...extra });
const testGroup = (name, image, filter) => group(name, "url-test", {
  icon: image, "include-all": true, "exclude-type": "direct", filter,
  "empty-fallback": "DIRECT", url: "https://www.gstatic.com/generate_204",
  interval: 600, tolerance: 50
});

const proxyGroups = [
  group("节点选择", "select", { icon: icon.proxy, "include-all": true, "exclude-type": "direct" }),
  group("全球加速", "select", { icon: icon.global, proxies: regionChoices }),
  group("苹果服务", "select", { icon: icon.apple, proxies: regionChoices }),
  group("ChatGPT", "select", { icon: icon.chatgpt, proxies: regionChoices }),
  group("港台番剧", "select", { icon: icon.streamingSE, proxies: regionChoices }),
  group("国际媒体", "select", { icon: icon.streaming, proxies: ["节点选择", ...regions] }),
  group("电报代理", "select", { icon: icon.telegram, proxies: regionChoices }),
  group("黑白名单", "select", { icon: icon.final, proxies: regionChoices }),
  testGroup("香港节点", icon.hk, "(?i)港|HK|Hong"),
  testGroup("台湾节点", icon.tw, "(?i)台|TW|Taiwan"),
  testGroup("日本节点", icon.jp, "(?i)日|阪|JP|Japan"),
  testGroup("狮城节点", icon.sg, "(?i)新|狮|獅|SG|Singapore"),
  testGroup("美国节点", icon.us, "(?i)美|US|States|American"),
  group("广告拦截", "select", { icon: icon.adblock, proxies: ["REJECT", "DIRECT"] }),
  group("隐私保护", "select", { icon: icon.privacy, proxies: ["REJECT", "DIRECT"] })
];

const ruleNames = ["Lan", "Direct", "Advertising", "Privacy", "OpenAI", "Claude", "Gemini", "TikTok", "Google", "SteamCN", "Telegram", "GlobalMedia", "BiliBili", "Proxy", "Apple", "China", "WeChat"];
const ruleProviders = {};
for (const name of ruleNames) {
  ruleProviders[name] = {
    type: "http",
    behavior: "classical",
    format: "text",
    url: `https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/${name}/${name}.list`,
    path: `./ruleset/${name}.list`,
    interval: 86400
  };
}

const rules = [
  "RULE-SET,Lan,DIRECT",
  "RULE-SET,Direct,DIRECT",
  "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",
  "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",
  "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
  "IP-CIDR,127.0.0.0/8,DIRECT,no-resolve",
  "IP-CIDR,100.64.0.0/10,DIRECT,no-resolve",
  "IP-CIDR,224.0.0.0/4,DIRECT,no-resolve",
  "RULE-SET,Advertising,广告拦截",
  "RULE-SET,Privacy,隐私保护",
  "RULE-SET,OpenAI,ChatGPT",
  "RULE-SET,Claude,日本节点",
  "RULE-SET,Gemini,日本节点",
  "RULE-SET,TikTok,日本节点",
  "RULE-SET,SteamCN,DIRECT",
  "RULE-SET,Telegram,电报代理",
  "RULE-SET,GlobalMedia,国际媒体",
  "RULE-SET,BiliBili,港台番剧",
  "RULE-SET,Apple,苹果服务",
  "RULE-SET,WeChat,DIRECT",
  "RULE-SET,Google,节点选择",
  "RULE-SET,China,DIRECT",
  "RULE-SET,Proxy,全球加速",
  "GEOSITE,CN,DIRECT",
  "GEOIP,CN,DIRECT",
  "MATCH,黑白名单"
];

function main(config) {
  config.dns = {
    "enable": true, "ipv6": false, "cache-algorithm": "arc",
    "enhanced-mode": "fake-ip", "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter": ["*.lan", "*.local", "localhost", "+.msftconnecttest.com", "+.msftncsi.com"],
    "default-nameserver": ["223.5.5.5", "119.29.29.29"],
    "nameserver": ["https://dns.alidns.com/dns-query", "https://doh.pub/dns-query"],
  };
  config["proxy-groups"] = proxyGroups;
  config["rule-providers"] = ruleProviders;
  config.rules = rules;
  return config;
}


