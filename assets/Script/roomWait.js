cc.Class({
    extends: cc.Component,

    properties: {
       roomNumLabel: {
           default: null,
           type: cc.Label
       },
       playerListLabel: {
           default: null,
           type: cc.Label
       }
    },

    // use this for initialization
    onLoad: function () {
        if(Grobal.roomWaitType == 'create'){
            Grobal.socket.emit('createRoom', Grobal.playerName);
        }
        if(Grobal.roomWaitType == 'join'){
            Grobal.socket.emit('joinRoom', Grobal.playerName + ',' + Grobal.roomNum);
        }


        var roomNumLabel = this.roomNumLabel;
        var playerListLabel = this.playerListLabel;

        // 监听房间创建成功
        Grobal.socket.on('createRoom', function(msg){
            console.log('create room:' + msg);

            var room = eval('(' + msg + ')');
            roomNumLabel.string = room.roomNum;
            var labelStr = room.playerList.length + '个人(';
            for(var i = 0; i < room.playerList.length; i++){
                var name = room.playerList[i].name;
                labelStr += name;
                if(i != room.playerList.length - 1){
                    labelStr += ',';
                } 
            }
            labelStr += ')';

            playerListLabel.string = labelStr;

            Grobal.roomNum = room.roomNum;
            Grobal.roomIndex = 0;//创建者的位置序号为0（第一个）
            onRoomJoin();
        });

        if(Grobal.roomNum != 0){
            onRoomJoin();
        } 

        function onRoomJoin(){
            Grobal.socket.on(Grobal.roomNum+'joinRoom', function(msg){
                console.log('join room:' + msg);

                var room = eval('(' + msg + ')');
                roomNumLabel.string = room.roomNum;

            var labelStr = room.playerList.length + '个人(';
            for(var i = 0; i < room.playerList.length; i++){
                var name = room.playerList[i].name;
                labelStr += name;
                if(i != room.playerList.length - 1){
                    labelStr += ',';
                } 
            }
            labelStr += ')';

                playerListLabel.string = labelStr;
            });
            //当前玩家的桌位序号
            Grobal.socket.on('joinRoom', function(msg){
                console.log('index:' + msg);
                Grobal.roomIndex = Number(msg);
            });

            Grobal.socket.on(Grobal.roomNum+'gameStart', function(msg){
                console.log('game start...');

                cc.director.loadScene('playing');
            });
        }      
    },

    

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
