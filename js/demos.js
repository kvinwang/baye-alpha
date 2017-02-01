
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

