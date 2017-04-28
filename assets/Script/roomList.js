cc.Class({
    extends: cc.Component,

    properties: {
       layout: {
           default: null,
           type: cc.Layout
       },
       roomPrefab: {
           default: null,
           type: cc.Prefab
       }
    },

    // use this for initialization
    onLoad: function () {
        var roomPrefab = this.roomPrefab;
        var layout = this.layout;

        Grobal.socket.emit('roomList', Grobal.playerName);
        Grobal.socket.on('roomList', function(msg){
            console.log(msg);
            var roomList = eval('(' + msg + ')');

            for(var i = 0; i < roomList.length; i++){
                var room = roomList[i];
                var roomNum = room.roomNum;
                var playerNameListStr = '';

                var playerList = room.playerList;
                for(var j = 0; j < playerList.length; j++){
                    playerNameListStr += playerList[j].name + ',';
                }

                var roomPrefabScript = cc.instantiate(roomPrefab).getComponent('roomPrefab');
                var labelStr = '房间:' + roomNum + ' (' + playerNameListStr + ')';
                roomPrefabScript.label.string = labelStr;
                roomPrefabScript.roomNum = roomNum;
                // console.log(labelStr);
                roomPrefabScript.enableButton(playerList.length < 3);

                layout.node.addChild(roomPrefabScript.node);
            }
        });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
