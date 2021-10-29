
baye.hooks.loadPeriod = function(ctx) {
    baye.centerChoose(100, 80, ["简单", "困难"], 0, function(idx) {
        console.log('chosen: ' + idx);
        if (idx == baye.None) {
            return 0; // 0 返回主界面， 1 继续选择君主
        }
        baye.loadPeriod(1); // 加载时期1数据
        // 可以在这里进一步做其它初始化配置
        return 1; // 继续选择君主
    });
}

