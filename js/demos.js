
baye.hooks.battleBuildAttackAttriutes = function(context) {
    /*
        脚本计算攻防示例
        context.index: 计算结果存放位置序号
        context.generalIndex: 战场将领序号
    */

    var result = baye.data.g_GenAtt[context.index];
    var pIndex = baye.data.g_FgtParam.GenArray[context.generalIndex] - 1;
    var person = baye.data.g_Persons[pIndex];

    // 地形对兵种的影响
    var terEffects = [
    //  草地, 平原, 山地, 森林, 村庄, 城池, 营寨, 河流
        [1, 1, 1, 1, 1, 1, 1, 1], // 骑兵
        [1, 1, 1, 1, 1, 1, 1, 1], // 步兵
        [1, 1, 1, 1, 1, 1, 1, 1], // 弓兵
        [1, 1, 1, 1, 1, 1, 1, 1], // 水兵
        [1, 1, 1, 1, 1, 1, 1, 1], // 极兵
        [1, 1, 1, 1, 1, 1, 1, 1], // 玄兵
    ];

    var AtkModulus = [1.0, 0.8, 0.9, 0.8, 1.3, 0.4];	/* 各兵种攻击系数 */
    var DfModulus =  [0.7, 1.2, 1.0, 1.1, 1.2, 0.6];	/* 各兵种防御系数 */
    var TerrDfModu = [1.0, 1.0, 1.3, 1.15, 1.1, 1.5, 1.2, 0.8];	/* 各种地形防御系数 */

    // 武力/等级/攻击系数影响攻击力
    var at = person.Force * (person.Level + 10) * AtkModulus[person.ArmsType];

    // 智力/等级/防御系数影响防御力
    var df = person.IQ * (person.Level + 10) * DfModulus[person.ArmsType];

    // 叠加地形对攻防的影响
    at = terEffects[person.ArmsType][result.ter] * at;

    df = terEffects[person.ArmsType][result.ter] * df;

    // 地形固有防御系数
    df *= TerrDfModu[result.ter];

    // 输出最终结果
    result.at = at;
    result.df = df;
};

baye.hooks.battleDrivePersonState = function(context) {
    var person = baye.getPersonByGeneralIndex(context.generalIndex);
    if (person.Arms > 0) person.Arms -= 1;
};

baye.hooks.countAttackHurt = function(context) {
    /*
        计算伤害示例

        查阅文档可知, 可以使用计算普通攻击伤害的钩子
            http://bgwp.oschina.io/baye-doc/script/index.html#baye-hooks-countattackhurt

        context.hurt: 计算结果存放位置序号

        如下是引擎默认算法:
    */

    var KeZhiMatrix = [
        [1.0, 1.2, 0.8, 1.0, 0.7, 1.3],
        [0.8, 1.0, 1.2, 1.0, 0.6, 1.2],
        [1.2, 0.8, 1.0, 1.0, 1.1, 1.2],
        [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
        [1.1, 1.3, 0.9, 1.0, 1.0, 1.5],
        [0.6, 0.6, 0.6, 0.6, 0.6, 0.6]
    ];

    var p0 = baye.data.g_GenAtt[0]; //攻击方数据
    var p1 = baye.data.g_GenAtt[1]; //防守方数据

    var person = baye.getPersonByGeneralIndex(p0.generalIndex);

    /* 基本伤害 hurt = (at / df) * arms / 8 */
    var hurt = p0.at / p1.df * (person.Arms >> 3);

    /* 相克加层 hurt *= modu */
    hurt *= KeZhiMatrix[p0.armsType][p1.armsType];
    context.hurt = hurt;
};

baye.hooks.countAttackHurt = function(context) {
    /*
        计算伤害示例

        查阅文档可知, 可以使用计算普通攻击伤害的钩子
            http://bgwp.oschina.io/baye-doc/script/index.html#baye-hooks-countattackhurt

        context.hurt: 计算结果存放位置序号

        引入其它条件(如特殊道具)影响伤害输出:
    */

    var KeZhiMatrix = [
        [1.0, 1.2, 0.8, 1.0, 0.7, 1.3],
        [0.8, 1.0, 1.2, 1.0, 0.6, 1.2],
        [1.2, 0.8, 1.0, 1.0, 1.1, 1.2],
        [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
        [1.1, 1.3, 0.9, 1.0, 1.0, 1.5],
        [0.6, 0.6, 0.6, 0.6, 0.6, 0.6]
    ];

    var p0 = baye.data.g_GenAtt[0]; //攻击方数据
    var p1 = baye.data.g_GenAtt[1]; //防守方数据

    var person = baye.getPersonByGeneralIndex(p0.generalIndex);

    /* 基本伤害 hurt = (at / df) * arms / 8 */
    var hurt = p0.at / p1.df * (person.Arms >> 3);

    /* 相克加层 hurt *= modu */
    hurt *= KeZhiMatrix[p0.armsType][p1.armsType];

    // 查找攻击方是否携带有特殊道具
    // baye.data.g_GenAtt里面有20个位置, 前十个为攻城方, 后十个为守城方
    //
    // 首先需要判断攻击者是攻城方还是守城放

    var startIndex = p0.generalIndex < 10 ? 0 : 10;

    var hasNewBeeTool = false;
    var newBeeToolID = 5; //牛逼道具的ID

    // 查找攻击方有没有牛逼道具
    for (var ind = startIndex; ind < startIndex + 10; ind++) {
        if (baye.data.g_GenPos[ind].state != 8) { // 8死亡
            var p = baye.getPersonByGeneralIndex(ind);
            if (p.Tool1 == newBeeToolID || p.Tool2 == newBeeToolID) {
                hasNewBeeTool = true; // 找到牛逼道具
                break;
            }
        }
    }

    if (hasNewBeeTool) {
        // 攻击方团队有牛逼道具, 百倍伤害
        hurt *= 100;
    }
    context.hurt = hurt;
};

// 禁止年龄自动增长
baye.data.g_engineConfig.disableAgeGrow = 1;

// 定义数据表
baye.TOOL_AGE_TAB = [10, 10, 0, 10 /* ... */ ];

// 赏赐时加属性
baye.hooks.giveTool = function(ctx) {
    var up = baye.TOOL_AGE_TAB[ctx.toolIndex];
    if (up > 0) {
        var person = baye.data.g_Persons[ctx.personIndex];
        person.Age += up;
    }
    ctx.result = 1;
};

// 没收时加属性
baye.hooks.takeOffTool = function(ctx) {
    var up = baye.TOOL_AGE_TAB[ctx.toolIndex];
    if (up > 0) {
        var person = baye.data.g_Persons[ctx.personIndex];
        person.Age -= up;
    }
    ctx.result = 1;
};

baye.hooks.takeOffTool = function(ctx) {
    baye.say(ctx.personIndex, "你算哪根葱?\n" + baye.getToolName(ctx.toolIndex) + "岂是你想拿走就拿走?", function() {
        baye.alert("没收失败!");
        ctx.result = 0;
    });
};

baye.hooks.willGiveTool = function(c) {
    // 1号道具 + 2号道具 + 3000金钱 可合成 3号道具

    if (baye.getPersonName(c.personIndex) != "马腾") {
        return -1;
    }

    var person = baye.data.g_Persons[c.personIndex];
    var city = baye.data.g_Cities[c.cityIndex];

    // 检查道具是否满足条件
    if (person.Tool1 - 1 == 1 && c.toolIndex == 2) {

        // 限制条件
        if (city.Money < 10000) {
            baye.say(c.personIndex, "城池不够富足,无法开工!");
            return 0;
        }
        if (city.PeopleDevotion < 99) {
            baye.say(c.personIndex, "城民们对你的治理不太满意,无法开工!");
            return 0;
        }
        if (city.State != 0) {
            baye.say(c.personIndex, "城池灾害,无法开工!");
            return 0;
        }
        city.Money -= 3000; // 扣除3000钱
        baye.deleteToolInCity(c.cityIndex, c.toolIndex); // 删除材料道具
        baye.putToolInCity(c.cityIndex, 3); // 生产出新道具
        baye.say(c.personIndex, "全新[" + baye.getToolName(3) + "]已打造成功!");
        return 0;
    }
    return -1;
};

baye.createCustomData = function() {
    // 创建初始数据
    switch (baye.data.g_PIdx) {
        case 1: //时期1
        case 2: //时期2
        case 3: //时期2
        case 4: //时期4
    }
    return {
        personNames: [],
    };
};

baye.hooks.didOpenNewGame = function() {
    // 新开局时初始化自定义数据
    baye.data.customData = baye.createCustomData();
};

baye.hooks.didLoadGame = function() {
    // 读档后需要从存档读取自定义数据
    var dat = JSON.parse(baye.getCustomData());
    baye.data.customData = dat ? dat : baye.createCustomData();
};

baye.hooks.willSaveGame = function() {
    // 存档后前需要保存自定义数据
    var data = JSON.stringify(baye.data.customData);
    baye.setCustomData(data);
};
