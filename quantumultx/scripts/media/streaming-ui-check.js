/***

Thanks to & modified from 
1. https://gist.githubusercontent.com/Hyseen/b06e911a41036ebc36acf04ddebe7b9a/raw/nf_check.js
2. https://github.com/AtlantisGawrGura/Quantumult-X-Scripts/blob/main/media.js
3. https://github.com/CoiaPrant/MediaUnlock_Test/blob/main/check.sh
4. https://github.com/Netflixxp/chatGPT/blob/main/chat.sh

For Quantumult-X 598+ ONLY!!

2023-02-14  初版，支持 ChatGPT 检测
2026-11-11  修订：
            - Disney+ 改为按首页重定向 / HTML location 字段判定（旧 CNBL 标记已失效）
            - ChatGPT 改用 chatgpt.com + cdn-cgi/trace，去掉 text/plain 判定
            - DAZN 区分「节点 IP 被拦」与「接口失效」
            - Netflix 兼容 X-Originating-URL 缺失，修复 region 解析
            - Discovery 简化 Cookie，只保留 st
            - 修复 finally 中 output 未定义、$done 可能被多次调用等问题

[task_local]

event-interaction https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/streaming-ui-check.js, tag=流媒体-解锁查询, img-url=checkmark.seal.system, enabled=true

@XIAO_KOP

**/

const BASE_URL = 'https://www.netflix.com/title/';
const BASE_URL_YTB = 'https://www.youtube.com/premium';
const BASE_URL_DISNEY = 'https://www.disneyplus.com/';
const BASE_URL_Dazn = 'https://startup.core.indazn.com/misl/v5/Startup';
const BASE_URL_Param = 'https://www.paramountplus.com/';
const FILM_ID = 81280792;

const BASE_URL_Discovery_token = 'https://us1-prod-direct.discoveryplus.com/token?deviceId=d1a4a5d25212400d1e6985984604d740&realm=go&shortlived=true';
const BASE_URL_Discovery = 'https://us1-prod-direct.discoveryplus.com/users/me';

const BASE_URL_GPT = 'https://chatgpt.com/';
const Region_URL_GPT = 'https://chatgpt.com/cdn-cgi/trace';

const arrow = ' ➟ ';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36';
const UA_WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

// 即将登陆
const STATUS_COMING = 2;
// 支持解锁
const STATUS_AVAILABLE = 1;
// 不支持解锁
const STATUS_NOT_AVAILABLE = 0;
// 检测超时
const STATUS_TIMEOUT = -1;
// 检测异常
const STATUS_ERROR = -2;

var opts = {
  policy: $environment.params
};

var opts1 = {
  policy: $environment.params,
  redirection: false
};

// 部分旗子做了修正（原 FO/SB 缺字母）
const flags = new Map([
  ['AC', '🇦🇨'], ['AE', '🇦🇪'], ['AF', '🇦🇫'], ['AG', '🇦🇬'], ['AL', '🇦🇱'], ['AM', '🇦🇲'], ['AO', '🇦🇴'],
  ['AR', '🇦🇷'], ['AT', '🇦🇹'], ['AU', '🇦🇺'], ['AW', '🇦🇼'], ['AZ', '🇦🇿'],
  ['BA', '🇧🇦'], ['BB', '🇧🇧'], ['BD', '🇧🇩'], ['BE', '🇧🇪'], ['BF', '🇧🇫'], ['BG', '🇧🇬'], ['BH', '🇧🇭'],
  ['BI', '🇧🇮'], ['BJ', '🇧🇯'], ['BM', '🇧🇲'], ['BN', '🇧🇳'], ['BO', '🇧🇴'], ['BR', '🇧🇷'], ['BS', '🇧🇸'],
  ['BT', '🇧🇹'], ['BW', '🇧🇼'], ['BY', '🇧🇾'], ['BZ', '🇧🇿'],
  ['CA', '🇨🇦'], ['CC', '🇨🇨'], ['CH', '🇨🇭'], ['CK', '🇨🇰'], ['CL', '🇨🇱'], ['CM', '🇨🇲'], ['CN', '🇨🇳'],
  ['CO', '🇨🇴'], ['CR', '🇨🇷'], ['CU', '🇨🇺'], ['CV', '🇨🇻'], ['CW', '🇨🇼'], ['CY', '🇨🇾'], ['CZ', '🇨🇿'],
  ['DE', '🇩🇪'], ['DJ', '🇩🇯'], ['DK', '🇩🇰'], ['DM', '🇩🇲'], ['DO', '🇩🇴'], ['DZ', '🇩🇿'],
  ['EC', '🇪🇨'], ['EE', '🇪🇪'], ['EG', '🇪🇬'], ['ER', '🇪🇷'], ['ES', '🇪🇸'], ['ET', '🇪🇹'],
  ['FI', '🇫🇮'], ['FJ', '🇫🇯'], ['FK', '🇫🇰'], ['FO', '🇫🇴'], ['FR', '🇫🇷'],
  ['GA', '🇬🇦'], ['GB', '🇬🇧'], ['GD', '🇬🇩'], ['GE', '🇬🇪'], ['GF', '🇬🇫'], ['GG', '🇬🇬'], ['GH', '🇬🇭'],
  ['GI', '🇬🇮'], ['GL', '🇬🇱'], ['GM', '🇬🇲'], ['GN', '🇬🇳'], ['GP', '🇬🇵'], ['GQ', '🇬🇶'], ['GR', '🇬🇷'],
  ['GT', '🇬🇹'], ['GW', '🇬🇼'], ['GY', '🇬🇾'],
  ['HK', '🇭🇰'], ['HN', '🇭🇳'], ['HR', '🇭🇷'], ['HT', '🇭🇹'], ['HU', '🇭🇺'],
  ['ID', '🇮🇩'], ['IE', '🇮🇪'], ['IL', '🇮🇱'], ['IM', '🇮🇲'], ['IN', '🇮🇳'], ['IQ', '🇮🇶'], ['IS', '🇮🇸'],
  ['IT', '🇮🇹'],
  ['JE', '🇯🇪'], ['JM', '🇯🇲'], ['JO', '🇯🇴'], ['JP', '🇯🇵'],
  ['KE', '🇰🇪'], ['KG', '🇰🇬'], ['KH', '🇰🇭'], ['KM', '🇰🇲'], ['KN', '🇰🇳'], ['KR', '🇰🇷'], ['KW', '🇰🇼'],
  ['KY', '🇰🇾'], ['KZ', '🇰🇿'],
  ['LA', '🇱🇦'], ['LB', '🇱🇧'], ['LC', '🇱🇨'], ['LI', '🇱🇮'], ['LK', '🇱🇰'], ['LR', '🇱🇷'], ['LS', '🇱🇸'],
  ['LT', '🇱🇹'], ['LU', '🇱🇺'], ['LV', '🇱🇻'], ['LY', '🇱🇾'],
  ['MA', '🇲🇦'], ['MC', '🇲🇨'], ['MD', '🇲🇩'], ['ME', '🇲🇪'], ['MF', '🇲🇫'], ['MG', '🇲🇬'], ['MH', '🇲🇭'],
  ['MK', '🇲🇰'], ['ML', '🇲🇱'], ['MM', '🇲🇲'], ['MN', '🇲🇳'], ['MO', '🇲🇴'], ['MQ', '🇲🇶'], ['MR', '🇲🇷'],
  ['MT', '🇲🇹'], ['MU', '🇲🇺'], ['MV', '🇲🇻'], ['MW', '🇲🇼'], ['MX', '🇲🇽'], ['MY', '🇲🇾'], ['MZ', '🇲🇿'],
  ['NA', '🇳🇦'], ['NC', '🇳🇨'], ['NE', '🇳🇪'], ['NF', '🇳🇫'], ['NG', '🇳🇬'], ['NI', '🇳🇮'], ['NL', '🇳🇱'],
  ['NO', '🇳🇴'], ['NP', '🇳🇵'], ['NR', '🇳🇷'], ['NU', '🇳🇺'], ['NZ', '🇳🇿'],
  ['OM', '🇴🇲'],
  ['PA', '🇵🇦'], ['PE', '🇵🇪'], ['PF', '🇵🇫'], ['PG', '🇵🇬'], ['PH', '🇵🇭'], ['PK', '🇵🇰'], ['PL', '🇵🇱'],
  ['PM', '🇵🇲'], ['PN', '🇵🇳'], ['PR', '🇵🇷'], ['PS', '🇵🇸'], ['PT', '🇵🇹'], ['PW', '🇵🇼'], ['PY', '🇵🇾'],
  ['QA', '🇶🇦'],
  ['RE', '🇷🇪'], ['RO', '🇷🇴'], ['RS', '🇷🇸'], ['RU', '🇷🇺'], ['RW', '🇷🇼'],
  ['SA', '🇸🇦'], ['SB', '🇸🇧'], ['SC', '🇸🇨'], ['SD', '🇸🇩'], ['SE', '🇸🇪'], ['SG', '🇸🇬'], ['SH', '🇸🇭'],
  ['SI', '🇸🇮'], ['SK', '🇸🇰'], ['SL', '🇸🇱'], ['SM', '🇸🇲'], ['SN', '🇸🇳'], ['SO', '🇸🇴'], ['SR', '🇸🇷'],
  ['SS', '🇸🇸'], ['ST', '🇸🇹'], ['SV', '🇸🇻'], ['SX', '🇸🇽'], ['SY', '🇸🇾'], ['SZ', '🇸🇿'],
  ['TC', '🇹🇨'], ['TD', '🇹🇩'], ['TG', '🇹🇬'], ['TH', '🇹🇭'], ['TJ', '🇹🇯'], ['TK', '🇹🇰'], ['TL', '🇹🇱'],
  ['TM', '🇹🇲'], ['TN', '🇹🇳'], ['TO', '🇹🇴'], ['TR', '🇹🇷'], ['TT', '🇹🇹'], ['TV', '🇹🇻'], ['TW', '🇹🇼'],
  ['TZ', '🇹🇿'],
  ['UA', '🇺🇦'], ['UG', '🇺🇬'], ['US', '🇺🇸'], ['UY', '🇺🇾'], ['UZ', '🇺🇿'],
  ['VA', '🇻🇦'], ['VC', '🇻🇨'], ['VE', '🇻🇪'], ['VG', '🇻🇬'], ['VI', '🇻🇮'], ['VN', '🇻🇳'], ['VU', '🇻🇺'],
  ['WF', '🇼🇫'], ['WS', '🇼🇸'],
  ['YE', '🇾🇪'], ['YT', '🇾🇹'],
  ['ZA', '🇿🇦'], ['ZM', '🇿🇲'], ['ZW', '🇿🇼']
]);

// 取旗子，取不到就返回空串，避免出现 "⟦undefined⟧"
function flagOf(region) {
  if (!region) return '';
  var f = flags.get(String(region).toUpperCase());
  return f ? '⟦' + f + '⟧' : '';
}

let result = {
  "title": '    📺  流媒体服务查询',
  "YouTube": '<b>YouTube: </b>检测失败，请重试 ❗️',
  "Netflix": '<b>Netflix: </b>检测失败，请重试 ❗️',
  "Dazn": '<b>Dazn: </b>检测失败，请重试 ❗️',
  "Disney": '<b>Disneyᐩ: </b>检测失败，请重试 ❗️',
  "Paramount": '<b>Paramountᐩ: </b>检测失败，请重试 ❗️',
  "Discovery": '<b>Discoveryᐩ: </b>检测失败，请重试 ❗️',
  "ChatGPT": '<b>ChatGPT: </b>检测失败，请重试 ❗️'
};

// 有些响应头大小写不固定，这里统一取
function headerOf(headers, name) {
  if (!headers) return '';
  var want = name.toLowerCase();
  for (var k in headers) {
    if (k.toLowerCase() === want) return headers[k];
  }
  return '';
}

function timeout(delay = 5000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('Timeout');
    }, delay);
  });
}

;(async () => {
  // 全部并发跑，任何一个挂掉都不影响其它项；等齐了再出结果，避免 $done 时还是“检测失败”的初始文案
  await Promise.all([
    testYTB().catch(e => console.log('YouTube error: ' + e)),
    testDazn().catch(e => console.log('Dazn error: ' + e)),
    testParam().catch(e => console.log('Paramount error: ' + e)),
    testDisneyPlus().catch(e => console.log('Disney error: ' + e)),
    testNf(FILM_ID).catch(e => console.log('Netflix error: ' + e)),
    testDiscovery().catch(e => console.log('Discovery error: ' + e)),
    testChatGPT().catch(e => console.log('ChatGPT error: ' + e))
  ]);

  // 取节点名（失败就退化成 $environment.params）
  let nodeLabel = $environment.params || '';
  try {
    let resp = await $configuration.sendMessage({
      action: 'get_policy_state',
      content: $environment.params
    });
    if (resp && resp.ret) {
      let raw = resp.ret[$environment.params];
      if (raw) {
        nodeLabel = JSON.stringify(raw).replace(/["\[\]]/g, '').replace(/,/g, ' ➟ ');
      }
    }
  } catch (e) {
    console.log('get_policy_state error: ' + e);
  }

  let rows = [
    result["YouTube"],
    result["Netflix"],
    result["Disney"],
    result["Dazn"],
    result["Paramount"],
    result["Discovery"],
    result["ChatGPT"]
  ];

  let content = '------------------------------' + '</br>' + rows.join('</br></br>');
  content = content + '</br>------------------------------</br>' +
    '<font color=#CD5C5C><b>节点</b> ➟ ' + nodeLabel + '</font>';
  content = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">` + content + `</p>`;

  $done({ "title": result["title"], "htmlMessage": content });
})();

/* ------------------------- Disney+ ------------------------- */

// 支持地区：首页 200，HTML 里带 "location":"XX" / "akamaiRegion":"XX"
// 不支持地区：302 到 /welcome/unavailable（旧版靠 CNBL 标记，现已删除）
function testDisneyPlus() {
  return new Promise((resolve) => {
    let option = {
      url: BASE_URL_DISNEY,
      opts: opts1,               // 不跟随跳转，才能看到 unavailable
      timeout: 7000,
      headers: {
        'Accept-Language': 'en',
        'User-Agent': UA
      }
    };

    $task.fetch(option).then(response => {
      let status = response.statusCode;
      let data = response.body || '';
      let location = headerOf(response.headers, 'Location');
      console.log('DisneyPlus: status=' + status + ', location=' + location);

      if (status === 301 || status === 302 || status === 303 || status === 307 || status === 308) {
        if (/unavailable/i.test(location)) {
          result["Disney"] = '<b>Disneyᐩ:</b> 未支持 🚫';
        } else {
          result["Disney"] = '<b>Disneyᐩ:</b> 检测异常 ❗️';
        }
        resolve();
        return;
      }

      if (status === 403) {
        result["Disney"] = '<b>Disneyᐩ:</b> 未支持 🚫';
        resolve();
        return;
      }

      if (status !== 200) {
        result["Disney"] = '<b>Disneyᐩ:</b> 检测失败 ❗️';
        resolve();
        return;
      }

      let match = data.match(/"location":"([A-Za-z]{2})"/) || data.match(/"akamaiRegion":"([A-Za-z]{2})"/);
      if (match) {
        let region = match[1].toUpperCase();
        result["Disney"] = '<b>Disneyᐩ:</b> 支持' + arrow + flagOf(region) + ' 🎉';
        console.log('DisneyPlus region: ' + region);
      } else if (/unavailable/i.test(data)) {
        result["Disney"] = '<b>Disneyᐩ:</b> 未支持 🚫';
      } else {
        result["Disney"] = '<b>Disneyᐩ:</b> 检测异常 ❗️';
      }
      resolve();
    }, reason => {
      console.log('DisneyPlus timeout: ' + reason);
      result["Disney"] = '<b>Disneyᐩ:</b> 检测超时 🚦';
      resolve();
    });
  });
}

/* ------------------------- Netflix ------------------------- */

function testNf(filmId) {
  return new Promise((resolve) => {
    let option = {
      url: BASE_URL + filmId,
      opts: opts,
      timeout: 5200,
      headers: {
        'User-Agent': UA
      }
    };

    $task.fetch(option).then(response => {
      console.log('nf:' + response.statusCode);

      if (response.statusCode === 404) {
        result["Netflix"] = '<b>Netflix: </b>支持自制剧集 ⚠️';
      } else if (response.statusCode === 403) {
        result["Netflix"] = '<b>Netflix: </b>未支持 🚫';
      } else if (response.statusCode === 200) {
        // 200 时会带 X-Originating-URL，形如 http://www.netflix.com/sg/title/81280792
        let url = headerOf(response.headers, 'X-Originating-URL') || headerOf(response.headers, 'Location');
        let region = '';
        if (url) {
          let segs = url.replace(/^https?:\/\//, '').split('/');
          let seg = segs[1] || '';
          if (/^[a-z]{2}(-[a-z]{2,})?$/i.test(seg)) {
            region = seg.slice(0, 2).toUpperCase();
          }
        }
        console.log('nf region: ' + region);
        if (region) {
          result["Netflix"] = '<b>Netflix: </b>完整支持' + arrow + flagOf(region) + ' 🎉';
        } else {
          // 拿不到地区头就别报错，至少说明能解锁
          result["Netflix"] = '<b>Netflix: </b>完整支持 🎉';
        }
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // 关掉重定向时可能直接拿到跳转
        let location = headerOf(response.headers, 'Location');
        let m = location && location.match(/\/([a-z]{2})\//i);
        if (m) {
          result["Netflix"] = '<b>Netflix: </b>完整支持' + arrow + flagOf(m[1]) + ' 🎉';
        } else {
          result["Netflix"] = '<b>Netflix: </b>完整支持 🎉';
        }
      } else {
        result["Netflix"] = '<b>Netflix: </b>检测失败 ❗️';
      }
      resolve();
    }, reason => {
      console.log('nf timeout: ' + reason);
      result["Netflix"] = '<b>Netflix: </b>检测超时 🚦';
      resolve();
    });
  });
}

/* ------------------------- YouTube ------------------------- */

function testYTB() {
  return new Promise((resolve) => {
    let option = {
      url: BASE_URL_YTB,
      opts: opts,
      timeout: 2800,
      headers: {
        'User-Agent': UA
      }
    };

    $task.fetch(option).then(response => {
      let data = response.body || '';
      console.log('ytb:' + response.statusCode);
      if (response.statusCode !== 200) {
        result["YouTube"] = '<b>YouTube Premium: </b>检测失败 ❗️';
      } else if (data.indexOf('Premium is not available in your country') !== -1) {
        result["YouTube"] = '<b>YouTube Premium: </b>未支持 🚫';
      } else {
        let region = '';
        let ret = /"GL":"(.*?)"/.exec(data) || /"countryCode":"(.*?)"/.exec(data);
        if (ret) {
          region = ret[1].toUpperCase();
        } else if (data.indexOf('www.google.cn') !== -1) {
          region = 'CN';
        }
        if (region) {
          result["YouTube"] = '<b>YouTube Premium: </b>支持' + arrow + flagOf(region) + ' 🎉';
        } else {
          result["YouTube"] = '<b>YouTube Premium: </b>支持 🎉';
        }
        console.log('ytb region: ' + region);
      }
      resolve();
    }, reason => {
      console.log('ytb timeout: ' + reason);
      result["YouTube"] = '<b>YouTube Premium: </b>检测超时 🚦';
      resolve();
    });
  });
}

/* ------------------------- DAZN ------------------------- */

function testDazn() {
  const extra = `{
    "LandingPageKey":"generic",
    "Platform":"web",
    "PlatformAttributes":{},
    "Manufacturer":"",
    "PromoCode":"",
    "Version":"2"
  }`;

  return new Promise((resolve) => {
    let option = {
      url: BASE_URL_Dazn,
      method: 'POST',
      opts: opts,
      timeout: 2800,
      headers: {
        'User-Agent': UA_WIN,
        'Content-Type': 'application/json'
      },
      body: extra
    };

    $task.fetch(option).then(response => {
      let data = response.body || '';
      console.log('Dazn:' + response.statusCode);

      if (response.statusCode === 200) {
        let ret = /"GeolocatedCountry":"(.*?)"/.exec(data);
        if (ret) {
          let region = ret[1].toUpperCase();
          result["Dazn"] = '<b>Dazn: </b>支持' + arrow + flagOf(region) + ' 🎉';
          console.log('Dazn region: ' + region);
        } else {
          result["Dazn"] = '<b>Dazn: </b>未支持 🚫';
        }
      } else if (response.statusCode === 403 && /security policy/i.test(data)) {
        // 接口正常，但机房/代理 IP 被 DAZN 风控拦了
        result["Dazn"] = '<b>Dazn: </b>节点被拦截（非流媒体地区判定）🚫';
      } else {
        result["Dazn"] = '<b>Dazn: </b>检测失败 ❗️';
      }
      resolve();
    }, reason => {
      console.log('Dazn timeout: ' + reason);
      result["Dazn"] = '<b>Dazn: </b>检测超时 🚦';
      resolve();
    });
  });
}

/* ------------------------- Paramount+ ------------------------- */

function testParam() {
  return new Promise((resolve) => {
    let option = {
      url: BASE_URL_Param,
      opts: opts1,
      timeout: 2800,
      headers: {
        'User-Agent': UA
      }
    };

    $task.fetch(option).then(response => {
      console.log('Paramountᐩ:' + response.statusCode);
      let location = headerOf(response.headers, 'Location');
      if (response.statusCode === 200) {
        result["Paramount"] = '<b>Paramountᐩ: </b>支持 🎉';
      } else if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
        result["Paramount"] = '<b>Paramountᐩ: </b>未支持 🚫';
        console.log('Paramountᐩ location: ' + location);
      } else if (response.statusCode === 403) {
        result["Paramount"] = '<b>Paramountᐩ: </b>未支持 🚫';
      } else {
        result["Paramount"] = '<b>Paramountᐩ: </b>检测失败 ❗️';
      }
      console.log('Paramountᐩ: ' + result["Paramount"]);
      resolve();
    }, reason => {
      console.log('Paramount timeout: ' + reason);
      result["Paramount"] = '<b>Paramountᐩ: </b>检测超时 🚦';
      resolve();
    });
  });
}

/* ------------------------- Discovery+ ------------------------- */

function testDiscovery() {
  return new Promise((resolve) => {
    let option = {
      url: BASE_URL_Discovery_token,
      opts: opts1,
      timeout: 2800,
      headers: {
        'User-Agent': UA_WIN
      },
      verify: false
    };

    $task.fetch(option).then(response => {
      console.log('GetToken:' + response.statusCode);
      if (response.statusCode !== 200) {
        result["Discovery"] = '<b>Discoveryᐩ: </b>检测失败 ❗️';
        resolve();
        return;
      }

      let token = '';
      try {
        token = JSON.parse(response.body)["data"]["attributes"]["token"];
      } catch (e) {
        console.log('GetToken parse error: ' + e);
        result["Discovery"] = '<b>Discoveryᐩ: </b>检测失败 ❗️';
        resolve();
        return;
      }

      let option1 = {
        url: BASE_URL_Discovery,
        opts: opts1,
        timeout: 2800,
        headers: {
          'User-Agent': UA_WIN,
          'Cookie': 'st=' + token
        },
        verify: false
      };

      $task.fetch(option1).then(response2 => {
        console.log('Discovery+ Check:' + response2.statusCode);
        try {
          let data = JSON.parse(response2.body);
          let territory = data["data"]["attributes"]["currentLocationTerritory"] || '';
          territory = String(territory).toUpperCase();
          if (territory === 'US') {
            result["Discovery"] = '<b>Discoveryᐩ: </b>支持' + arrow + flagOf(territory) + ' 🎉';
          } else if (territory) {
            result["Discovery"] = '<b>Discoveryᐩ: </b>未支持 🚫';
          } else {
            result["Discovery"] = '<b>Discoveryᐩ: </b>检测异常 ❗️';
          }
        } catch (e) {
          console.log('Discovery parse error: ' + e);
          result["Discovery"] = '<b>Discoveryᐩ: </b>检测失败 ❗️';
        }
        resolve();
      }, reason => {
        console.log('Discovery check error: ' + reason);
        result["Discovery"] = '<b>Discoveryᐩ: </b>检测超时 🚦';
        resolve();
      });
    }, reason => {
      console.log('GetToken error: ' + reason);
      result["Discovery"] = '<b>Discoveryᐩ: </b>检测超时 🚦';
      resolve();
    });
  });
}

/* ------------------------- ChatGPT ------------------------- */

// 2023 年的白名单，OpenAI 后来陆续放开，仅作参考
const support_countryCodes = ["T1","XX","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ","BS","BD","BB","BE","BZ","BJ","BT","BA","BW","BR","BG","BF","CV","CA","CL","CO","KM","CR","HR","CY","DK","DJ","DM","DO","EC","SV","EE","FJ","FI","FR","GA","GM","GE","DE","GH","GR","GD","GT","GN","GW","GY","HT","HN","HU","IS","IN","ID","IQ","IE","IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG","LV","LB","LS","LR","LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR","MU","MX","MC","MN","ME","MA","MZ","MM","NA","NR","NP","NL","NZ","NI","NE","NG","MK","NO","OM","PK","PW","PA","PG","PE","PH","PL","PT","QA","RO","RW","KN","LC","VC","WS","SM","ST","SN","RS","SC","SL","SG","SK","SI","SB","ZA","ES","LK","SR","SE","CH","TH","TG","TO","TT","TN","TR","TV","UG","AE","US","UY","VU","ZM","BO","BN","CG","CZ","VA","FM","MD","PS","KR","TW","TZ","TL","GB"];

function testChatGPT() {
  return new Promise((resolve) => {
    let option = {
      url: BASE_URL_GPT,
      opts: opts,
      timeout: 5000,
      headers: {
        'User-Agent': UA
      }
    };

    $task.fetch(option).then(response => {
      console.log('ChatGPT Main Test: ' + response.statusCode);

      if (response.statusCode === 403 || response.statusCode === 451) {
        result["ChatGPT"] = '<b>ChatGPT: </b>未支持 🚫';
        resolve();
        return;
      }
      if (response.statusCode !== 200) {
        result["ChatGPT"] = '<b>ChatGPT: </b>检测失败 ❗️';
        resolve();
        return;
      }

      let option1 = {
        url: Region_URL_GPT,
        opts: opts,
        timeout: 5000,
        headers: {
          'User-Agent': UA
        }
      };

      $task.fetch(option1).then(response2 => {
        let body = response2.body || '';
        let m = body.match(/loc=([A-Za-z]{2})/);
        let region = m ? m[1].toUpperCase() : '';
        console.log('ChatGPT Region: ' + region);

        if (!region) {
          result["ChatGPT"] = '<b>ChatGPT: </b>检测异常 ❗️';
        } else if (support_countryCodes.indexOf(region) !== -1) {
          result["ChatGPT"] = '<b>ChatGPT: </b>支持' + arrow + flagOf(region) + ' 🎉';
        } else {
          result["ChatGPT"] = '<b>ChatGPT: </b>未支持 🚫';
        }
        resolve();
      }, reason => {
        console.log('ChatGPT region error: ' + reason);
        result["ChatGPT"] = '<b>ChatGPT: </b>检测超时 🚦';
        resolve();
      });
    }, reason => {
      console.log('ChatGPT error: ' + reason);
      result["ChatGPT"] = '<b>ChatGPT: </b>检测超时 🚦';
      resolve();
    });
  });
}
