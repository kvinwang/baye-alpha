
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
