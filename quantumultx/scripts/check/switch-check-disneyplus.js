/***

Thanks to & modified from 
1. https://gist.githubusercontent.com/Hyseen/b06e911a41036ebc36acf04ddebe7b9a/raw/nf_check.js

For Quantumult-X 598+ ONLY!!

2022-07-23 

[task_local]

// UI 查询版本
event-interaction https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/switch-check-disneyplus.js, tag=Disneyᐩ 检测&切换, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Disney.png, enabled=true

//cron 版本
0 8 * * * https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/switch-check-disneyplus.js#policy=你的策略组名, tag=Disneyᐩ 定时切换, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Disney.png, enabled=true

ps. 简单粗暴的 UI-Interaction 版本。无数据持久化、粗暴延迟等待。完美主义建议使用 Helge大佬的boxjs版本 https://t.me/QuanXNews/193

@XIAO_KOP

**/

const BASE_URL_DISNEY = 'https://www.disneyplus.com';
const arrow = " ➟ "

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'

// 即将登陆
const STATUS_COMING = 2
// 支持解锁
const STATUS_AVAILABLE = 1
// 不支持解锁
const STATUS_NOT_AVAILABLE = 0
// 检测超时
const STATUS_TIMEOUT = -1
// 检测异常
const STATUS_ERROR = -2

const link = { "media-url": "https://raw.githubusercontent.com/kakbga/ruleset-routing/main/quantumultx/image/20260314.png" } 

var cronsign = $environment.executeType == 0 || $environment.executeType == "0" || $environment.executeType == "-1"? "Y" : "N"
var policy = $environment.executeType == 0 || $environment.executeType == "0" || $environment.executeType == "-1"? GetPolicy($environment.sourcePath) : $environment.params
console.log(JSON.stringify($environment))
console.log("策略组："+policy)

function GetPolicy(cnt) {
    if (cnt && cnt.indexOf("#policy=") !=-1) {
        return decodeURIComponent(cnt.split("#policy=")[1].trim())
    }else {
        return ""
    }
}


const message = {
    action: "get_customized_policy",
    content: policy

};

var output=[]
var OKList=[]
var ResList=["即将登陆节点 ➟ "]
var NoList=["不支持节点 ➟ "]
var timeoutList=["检测超时节点 ➟ "]
var pflag=1 //是否是策略，或者简单节点
var sign=0 //是否停止


$configuration.sendMessage(message).then(resolve => {
    if (resolve.error) {
        console.log(resolve.error);
        $done()
    }
    if (resolve.ret) {
        output=JSON.stringify(resolve.ret[message.content])? JSON.parse(JSON.stringify(resolve.ret[message.content]["candidates"])) : [policy]
        pflag = JSON.stringify(resolve.ret[message.content])? pflag:0
        console.log("Disneyᐩ 检测&切换")
        console.log("节点or策略组："+pflag)
        console.log(JSON.stringify(resolve.ret))
        if (pflag==1) {
        console.log("节点数量："+resolve.ret[policy]["candidates"].length)
        if(resolve.ret[policy]["candidates"].length==0) {
            $done({"title":"Disneyᐩ 检测&切换","htmlMessage":`<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>😭 无有效节点</b>`});
        }
    }

        //$notify(typeof(output),output)
        Check()
        //$done({"title":"策略内容","message":output})
    }
    //$done();|
}, reject => {
    // Normally will never happen.
    $done();
});

function Len(cnt) {
    return cnt.length-1
}

function Check() {
    var relay = 2000;
    for ( var i=0;i < output.length;i++) {
        testDisneyPlus(output[i])
    }
    if (output.length<=3) {
        relay = 3500
    } else if (output.length<=5) {
        relay = 4000
    } else if (output.length<10) {
        relay =4500
    } else if (output.length<15) {
        relay =6500
    } else if (output.length<20) {
        relay =8500
    } else if (output.length<50){
        relay =11000
    } else {
        relay =13000
    }
    console.log(output.length+":"+relay)
    setTimeout(() => {
        console.log("⛳️ 共计 "+OKList.length+" 个：支持节点 ➟ "+ OKList)
        console.log("🏠 共计 "+Len(NoList)+" 个："+NoList)
        console.log("🕹 共计 "+Len(timeoutList)+" 个："+timeoutList)
        sign = 1
        if (OKList[0] && pflag==1) { //有支持节点、且为策略组才操作
            console.log("开始排序")
            ReOrder(OKList)
        } else if (!OKList[0]){ //不支持
            content = pflag==0 ? `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>😭 该节点不支持Disneyᐩ  </b><br><br>👇<br><br><font color=#FF5733>-------------------------<br><b>⟦ `+policy+` ⟧ </b><br>-------------------------</font>`: `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">` + "<br>❌  <b>⟦ "+policy+ " ⟧ </b>⚠️ 切换失败<br><br><b>该策略组内未找到支持 Disneyᐩ </b> 的节点" + "<br><br><font color=#FF5733>-----------------------------<br><b>检测详情请查看JS脚本记录</b><br>-----------------------------</font>"+`</p>`
            $done({"title":"Disneyᐩ 检测&切换", "htmlMessage": content})
        } else if (OKList[0]){ //支持, 但为节点
            content = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>🎉 该节点支持 Disneyᐩ  ➟` + OKList[0].split(": 支持 ")[1]+`</b><br><br>👇<br><br><font color=#FF5733>-------------------------<br><b>⟦ `+policy+` ⟧ </b><br>-------------------------</font>`
            $done({"title":"Disneyᐩ 检测&切换", "htmlMessage": content})
        }
    }, relay)
    
}



//选择最优延迟节点
function ReOrder(cnt) {
    const array = cnt//;
    const messageURL = {
    action: "url_latency_benchmark",
    content: array.map(item=>item.split(": 支持 ")[0])
};
    $configuration.sendMessage(messageURL).then(resolve => {
    if (resolve.error) {
        console.log(resolve.error);
    }
    if (resolve.ret) {
        let output=JSON.stringify(resolve.ret);
        //console.log("节点延迟："+output);
        //排序
        //console.log("排序前: "+ array)
        if(array){
            try {
        array.sort(function (a,b) {
            //console.log(a+" VS "+b)
            a=a.split(": 支持 ")[0]
            b=b.split(": 支持 ")[0]
        return (resolve.ret[a][1]!=-1 && resolve.ret[b][1] !=-1)? resolve.ret[a][1]-resolve.ret[b][1] : resolve.ret[b][1]
    })
    } catch (err) {
        console.log(err)
    }
    }  
    console.log("排序后: "+array)
    let Ping =resolve.ret[array[0].split(": 支持 ")[0]]
        const dict = { [policy] : array[0].split(": 支持 ")[0]};
        if(array[0]) {
            console.log("选定支持 Disneyᐩ 节点："+array[0].split(": 支持 ")[0]+"延迟数据为 👉"+Ping)
            Ping = " ⚡️ 节点延迟 ➟ 「 "+Ping + " 」 "
        }
        const mes1 = {
            action: "set_policy_state",
            content: dict
        }; 
        $configuration.sendMessage(mes1).then(resolve => {
            if (resolve.error) {
                console.log(resolve.error);
                content =pflag==0 && array[0]? `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">` + "<br><b>⟦ "+policy+ " ⟧ </b><br><br>🎉 该节点支持 <b>Disneyᐩ ➟" + array[0].split(": 支持 ")[1]+ `</b></p>` : `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">` + "<br><b>⟦ "+policy+ " ⟧ </b><br><br>⚠️ 该节点不支持 <b>Disneyᐩ </b>" + `</p>`
                
                content =pflag==0 && ResList[1]? `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">` + "<br><b>⟦ "+policy+ " ⟧ </b><br><br>🚦 即将登陆节点所在地区 ➟<b>" + ResList[1].split("登陆 ")[1]+`</b> </p>` : content
                
                content = pflag!=0 && !array[0]? `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">` + "<br>❌   <b>⟦ "+policy+ " ⟧ </b>⚠️ 切换失败<br><br>该策略组内未找到支持 <b>Disneyᐩ </b>的节点" + "<br><br>-----------------------------<br><b><font color=#FF5733>检测详情请查看JS脚本记录</font></b><br>-----------------------------"+`</p>` : content
                console.log(content)
                $done({"title":"Disneyᐩ 检测&切换", "htmlMessage": content})
            }
            if (resolve.ret) {
                console.log("已经切换至支持 Disneyᐩ"+array[0].split(": 支持 ")[1]+"的路线 ➟ "+array[0].split(": 支持 ")[0])
                if (cronsign == "Y") { $notify("📺 Disneyᐩ 定时检测&切换", "🎉 已经切换至支持 Disneyᐩ 的最优延迟线路👇", array[0] +"\n 👉 "+Ping)}
                content = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">` + "<br> <b>⟦ "+policy+ " ⟧</b> 已切换至支持 <b>Disneyᐩ "+array[0].split(": 支持 ")[1]+"</b>中延迟最优的路线<br> <br>👇<br><br> ⟦ "+array[0].split(": 支持 ")[0]+ " ⟧" + "<br><br><font color=#16A085>"+Ping+"</font><br><font color=#FF5733>-----------------------------<br><b><font color=#FF5733>检测详情请查看JS脚本记录</font></b><br>-----------------------------"+`</p>`
                $done({"title":"Disneyᐩ 检测&切换", "htmlMessage": content })
            }
    }, reject => {
            $done();
        });  
    }
    //$done();
}, reject => {
    // Normally will never happen.
    $done();
});
}


async function testDisneyPlus(pname) {
    try {
        let { region, cnbl } = await Promise.race([testHomePage(pname), timeout(7000)])
        //console.log(`homepage: region=${region}, cnbl=${cnbl}`)
        // 即将登陆
//      if (cnbl == 2) {
//          ResList.push(pname+": 即将登陆 「"+region+"」") //coming
//          console.log(pname+"22: 即将登陆"+region)
//          return { region, status: STATUS_COMING }
//      }
        let { countryCode, inSupportedLocation, accessToken } = await Promise.race([getLocationInfo(pname), timeout(7000)])
        //console.log(`getLocationInfo: countryCode=${countryCode}, inSupportedLocation=${inSupportedLocation}`)
        
        region = countryCode ?? region
        // 即将登陆
        if (sign==0) {
        if (inSupportedLocation === false || inSupportedLocation === 'false') {
            ResList.push(pname+": 即将登陆 「"+region+"」") //coming
            console.log(pname+": 即将登陆 「"+region+"」")
            return { region, status: STATUS_COMING }
        } else {
            // 支持解锁

            OKList.push(pname+": 支持 「"+region+"」")
            console.log(pname+": 支持 「"+region+"」")
            return { region, status: STATUS_AVAILABLE }
        }
        let support = await Promise.race([testPublicGraphqlAPI(accessToken), timeout(7000)])
      if (!support) {
      return { status: STATUS_NOT_AVAILABLE }
    }
    // 支持解锁
    return { region, status: STATUS_AVAILABLE }

    } // sign    
    } catch (error) {
        //console.log(pname+": 检测错误"+error)
        //console.log("error:"+error)
        if (sign==0) {
        // 不支持解锁
        if (error === 'Not Available') {
            NoList.push(pname)
            console.log(pname+":不支持")
            return { status: STATUS_NOT_AVAILABLE }
        }
        
        // 检测超时
        if (error === 'Timeout') {
            timeoutList.push(pname)
            console.log(pname+":检测超时")
            return { status: STATUS_TIMEOUT }
        }
        
        return { status: STATUS_ERROR }
    }
    } 
    
}

function getLocationInfo(pname) {
    opts = {
        policy:pname
    }
    return new Promise((resolve, reject) => {
        let opts0 = {
            url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql',
            method: "POST",
            opts: opts,
            headers: {
                'Accept-Language': 'en',
                "Authorization": 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
                'Content-Type': 'application/json',
                'User-Agent': UA,
            },
            body: JSON.stringify({
                query: 'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }',
                variables: {
                    input: {
                        applicationRuntime: 'chrome',
                        attributes: {
                          browserName: 'chrome',
                          browserVersion: '94.0.4606',
                          manufacturer: 'apple',
                          model: null,
                          operatingSystem: 'macintosh',
                          operatingSystemVersion: '10.15.7',
                          osDeviceIds: [],
                        },
                        deviceFamily: 'browser',
                        deviceLanguage: 'en',
                        deviceProfile: 'macosx',
                    },
                },
            }),
        }
        
        $task.fetch(opts0).then(response => {
            let data = response.body
            //console.log("locationinfo:"+response.statusCode)
            if (response.statusCode !== 200) {
                //console.log('getLocationInfo: ' + data)
                reject('Not Available')
                return
            } else {
                let {
                  token: { accessToken },
                  session: {
                    inSupportedLocation,
                    location: { countryCode },
            },
            } = JSON.parse(data)?.extensions?.sdk
                resolve({ inSupportedLocation, countryCode, accessToken })
            }
        }, reason => {
            reject('Error')
            return
        })
    })
}

function testHomePage(pname) {
    opts = {
        policy : pname
    }
    return new Promise((resolve, reject) => {
        let opts0 = {
            url: 'https://www.disneyplus.com/',
            opts: opts,
            headers: {
                'Accept-Language': 'en',
                'User-Agent': UA,
            },
        }
        $task.fetch(opts0).then(response => {
            let data = response.body
            //console.log("homepage"+response.statusCode)
            if (response.statusCode !== 200 || data.indexOf('not available in your') !== -1) {
                reject('Not Available')
                return
            } else {
                let match = data.match(/Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/)
                if (!match) {
                    resolve({ region: '', cnbl: '' })
                    return
                } else {
                    let region = match[1]
                    let cnbl = match[2]
                    //console.log("homepage"+region+cnbl)
                    resolve({ region, cnbl })
                }
            }
        }, reason => {
            reject('Error')
            return
        })
    })
}

function testPublicGraphqlAPI(accessToken) {
  return new Promise((resolve, reject) => {
    let opts = {
      url: 'https://disney.api.edge.bamgrid.com/v1/public/graphql',
      headers: {
        'Accept-Language': 'en',
        Authorization: accessToken,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36',
      },
      body: JSON.stringify({
        query:
          'query($preferredLanguages: [String!]!, $version: String) {globalization(version: $version) { uiLanguage(preferredLanguages: $preferredLanguages) }}',
        variables: { version: '1.5.0', preferredLanguages: ['en'] },
      }),
    }

    $task.fetch(opts).then( response => {

      resolve(response.status === 200)
    }, reason => {
        reject('Error')
        return
    })
  })
}

function timeout(delay = 5000) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject('Timeout')
        }, delay)
    })
}

