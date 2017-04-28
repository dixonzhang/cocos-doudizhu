cc.Class({
    extends: cc.Component,

    properties: {
       label: {
           default: null,
           type: cc.Label
       },
       button: {
           default: null,
           type: cc.Button
       },
       roomNum: 0
    },

    // use this for initialization
    onLoad: function () {
         this.button.node.on('click', this.joinCallback, this);
    },

    joinCallback: function(){
        Grobal.roomNum = this.roomNum;
        Grobal.roomWaitType = 'join';
        cc.director.loadScene('roomWait');
    },

    enableButton: function(flag){
        this.button.enabled = flag;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
