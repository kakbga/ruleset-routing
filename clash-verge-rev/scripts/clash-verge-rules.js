function main(config) {
  config['tcp-concurrent'] = true
  config['geodata-mode'] = true
  config['geo-auto-update'] = true
  config['geo-update-interval'] = 48
  config['geox-url'] = {
    geosite: 'https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geosite.dat',
    geoip: 'https://raw.githubusercontent.com/Loyalsoldier/geoip/release/geoip-only-cn-private.dat'
  }
  config.dns = {
    enable: true, ipv6: false, 'cache-algorithm': 'arc',
    'enhanced-mode': 'fake-ip', 'fake-ip-range': '198.18.0.1/16',
    "fake-ip-filter": ["*.lan", "*.local", "localhost", "+.msftconnecttest.com", "+.msftncsi.com"],
    'default-nameserver': ['223.5.5.5', '223.6.6.6'],
    'nameserver': ['https://doh.pub/dns-query', 'https://dns.alidns.com/dns-query'],
    'nameserver-policy': {
      'geosite:cn': ['https://doh.pub/dns-query', 'https://dns.alidns.com/dns-query'],
      'geosite:private': ['https://doh.pub/dns-query', 'https://dns.alidns.com/dns-query']
    }
  }
  const allProxies = config.proxies.map(p => p.name)
  const hkProxies = allProxies.filter(name => /(香港|HK|HKG)/i.test(name))
  const twProxies = allProxies.filter(name => /(台湾|TW|Taiwan)/i.test(name))
  const jpProxies = allProxies.filter(name => /(日本|JP|Japan|大阪|Tokyo|Osaka)/i.test(name))
  const sgProxies = allProxies.filter(name => /(狮城|新加坡|SG|Singapore)/i.test(name))
  const usProxies = allProxies.filter(name => /(美国|US|USA|America)/i.test(name))
  const assistantNodes = [...allProxies]
  const checkNodes = nodes => nodes.length > 0 ? nodes : allProxies
  const autoGroup = {
    name: '♻️ 自动选择',
    type: 'url-test',
    url: 'http://www.gstatic.com/generate_204',
    interval: 600,
    tolerance: 50,
    proxies: allProxies
  }
  const fallbackGroup = {
    name: '🔄 故障转移',
    type: 'fallback',
    url: 'http://www.gstatic.com/generate_204',
    interval: 600,
    proxies: allProxies
  }
  const proxyGroup = {
    name: '🌐 PROXY',
    type: 'select',
    proxies: ['♻️ 自动选择', '🔄 故障转移', ...allProxies]
  }
  const assistantGroup = {
    name: '🤖 智能助理',
    type: 'select',
    proxies: assistantNodes
  }
  const hkGroup = {
    name: '🇭🇰 香港节点',
    type: 'select',
    proxies: checkNodes(hkProxies)
  }
  const twGroup = {
    name: '🇹🇼 台湾节点',
    type: 'select',
    proxies: checkNodes(twProxies)
  }
  const jpGroup = {
    name: '🇯🇵 日本节点',
    type: 'select',
    proxies: checkNodes(jpProxies)
  }
  const sgGroup = {
    name: '🇸🇬 狮城节点',
    type: 'select',
    proxies: checkNodes(sgProxies)
  }
  const usGroup = {
    name: '🇺🇸 美国节点',
    type: 'select',
    proxies: checkNodes(usProxies)
  }
  config['proxy-groups'] = [proxyGroup, autoGroup, fallbackGroup, assistantGroup, hkGroup, twGroup, jpGroup, sgGroup, usGroup]
  config['rule-providers'] = {
    applications: {
      type: 'http',
      behavior: 'classical',
      url: 'https://raw.githubusercontent.com/kakbga/ruleset-routing/main/clash-verge-rev/ruleset/applications.yaml',
      path: 'ruleset/applications.yaml',
      interval: 86400
    },
    AI: {
      type: 'http',
      behavior: 'classical',
      url: 'https://raw.githubusercontent.com/kakbga/ruleset-routing/main/clash-verge-rev/ruleset/AI.yaml',
      path: 'ruleset/AI.yaml',
      interval: 86400
    },
    SteamCN: {
      type: 'http',
      behavior: 'classical',
      url: 'https://raw.githubusercontent.com/kakbga/ruleset-routing/main/clash-verge-rev/ruleset/SteamCN.yaml',
      path: 'ruleset/SteamCN.yaml',
      interval: 86400
    }
  }
  config.rules = [
    'GEOIP,private,DIRECT,no-resolve',
    'GEOSITE,private,DIRECT',
    'GEOSITE,category-ads-all,REJECT',
    'DOMAIN-SUFFIX,javdb.com,🇯🇵 日本节点',
    'DOMAIN-SUFFIX,dmm.com,🇯🇵 日本节点',
    'GEOSITE,telegram,🌐 PROXY',
    'GEOSITE,tiktok,🌐 PROXY',
    'GEOSITE,google,🌐 PROXY',
    'RULE-SET,AI,🤖 智能助理',
    'RULE-SET,SteamCN,DIRECT',
    'GEOSITE,apple-cn,DIRECT',
    'GEOSITE,cn,DIRECT',
    'GEOIP,cn,DIRECT,no-resolve',
    'RULE-SET,applications,DIRECT',
    'MATCH,🌐 PROXY'
  ]
  return config
}
