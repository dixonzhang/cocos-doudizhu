window.Grobal = {
    playerName: null,   //玩家昵称
    socket: null,
    roomWaitType: 'create',
    roomNum: 0,             //房号
    allPokers: new Array(), //所有牌
    selectPokers: new Array(),//选择的牌
    isPass: false,          //是否点了不出
    roomIndex: -1            // 当前玩家位置的序号 （0，1，2）
}