cc.Class({
    extends: cc.Component,

    properties: {
        playerNameBox: {
            default: null,
            type: cc.EditBox
        },
        createButton: {
            default: null,
            type: cc.Button
        },
        joinButton: {
            default: null,
            type: cc.Button
        }
    },

    // use this for initialization
    onLoad: function () {
        Grobal.socket = io.connect("localhost:3000");

        Grobal.socket.on('hello', function(msg){
            console.log('收到消息:' + msg);
            // Grobal.clientId = msg;
        });

        this.createButton.node.on('click', this.createCallback, this);
        this.joinButton.node.on('click', this.joinCallback, this);
    },

    // 创建房间
    createCallback: function (event) {
        var playerName = this.playerNameBox.string;
        // alert(playerName);
        if(playerName == ''){
            alert('请输入昵称');
        }
        else{
            Grobal.playerName = playerName;
            // 跳转房间等候场景
            Grobal.roomWaitType = 'create';
            cc.director.loadScene('roomWait');
        }
    },

    // 创建房间
    joinCallback: function (event) {
        var playerName = this.playerNameBox.string;
        // alert(playerName);
        if(playerName == ''){
            alert('请输入昵称');
        }
        else{
            Grobal.playerName = playerName;
            // 跳转房间等候场景
            cc.director.loadScene('roomList');
        }
    },
    // called every frame
    // update: function (dt) {

    // },
});
