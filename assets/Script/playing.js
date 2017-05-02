cc.Class({
    extends: cc.Component,

    properties: {
        poker: {
           default: null,
           type: cc.Prefab
        },
        myNode: {
            default: null,
            type: cc.Node
        },
        displayNode: {
            default: null,
            type: cc.Node
        },
        playButton: {
            default: null,
            type: cc.Button
        },
        passButton: {
            default: null,
            type: cc.Button
        },
        readyButton: {
            default: null,
            type: cc.Button
        },
        buqiangButton: {
            default: null,
            type: cc.Button
        },
        qiangButton: {
            default: null,
            type: cc.Button
        },
        dizhuNode: {
            default: null,
            type: cc.Node
        },
        leftHandPokerNode: {
            default: null,
            type: cc.Node
        },
        leftDisplayNode: {
            default: null,
            type: cc.Node
        },
        rightHandPokerNode: {
            default: null,
            type: cc.Node
        },
        rightDisplayNode: {
            default: null,
            type: cc.Node
        },
        backPrefab: {
            default: null,
            type: cc.Prefab
        },
        backPrefabPool: null,
        clickTimeArray: null,
        pokerSpriteFrameMap: null
    },

    // use this for initialization
    onLoad: function () {
        this.backPrefabPool = new cc.NodePool();

        this.pokerSpriteFrameMap = {};
        this.clickTimeArray = new Array();
        var pokerSpriteFrameMap = this.pokerSpriteFrameMap;
        var self = this;

        //出牌按钮注册
        this.playButton.node.on(cc.Node.EventType.TOUCH_START, this.playBCallBack, this);
        this.node.on(cc.Node.EventType.TOUCH_START, this.nodeDoubleClickCallBack, this);
        this.passButton.node.on(cc.Node.EventType.TOUCH_START, this.passCallBack, this);
        this.readyButton.node.on(cc.Node.EventType.TOUCH_START, this.readyCallBack, this);
        this.buqiangButton.node.on(cc.Node.EventType.TOUCH_START, this.buqiangCallBack, this);
        this.qiangButton.node.on(cc.Node.EventType.TOUCH_START, this.qiangCallBack, this);

        cc.loader.loadRes("imgs/poker", cc.SpriteAtlas, function (err, assets) {
            // assets 是一个 SpriteFrame 数组，已经包含了图集中的所有 SpriteFrame。
            // 而 loadRes('test assets/sheep', cc.SpriteAtlas, function (err, atlas) {...}) 获得的则是整个 SpriteAtlas 对象。
            // console.log('---' + err);
            console.log('====' + assets);
            // cc.SpriteAtlas;

            var sflist = assets.getSpriteFrames();
            // cc.SpriteFrame
            for(var i = 0; i < sflist.length; i++){
                var sf = sflist[i];
                
                // console.log(JSON.stringify(sf));
                // console.log(sf._name);
                pokerSpriteFrameMap[sf._name] = sf;
            }

            self.init();
        });
    },

    init: function(){
        var pokerPrefab = this.poker;
        var myNode = this.myNode;
        var displayNode = this.displayNode;
        var playButton = this.playButton;
        var passButton = this.passButton;
        var readyButton = this.readyButton;
        var self = this;
        var pokerSpriteFrameMap = this.pokerSpriteFrameMap;

        Grobal.socket.on(Grobal.playerName + 'dealingCards', function(msg){
            // console.log(msg);
            var msgBean = eval('(' + msg + ')');

            var pokerList = msgBean.pokerList;

            // var dizhuPokers = msgBean.dizhuPokers;
            // // console.log('dizhu pai:' + JSON.stringify(dizhuPokers));
            // if(dizhuPokers){
            //     for(var i = 0; i < dizhuPokers.length; i++){
            //         var poker = dizhuPokers[i];
            //         // console.log('poker:' + poker.name);
            //         pokerList.push(poker);
            //     }
            // }

            Grobal.allPokers = pokerList;
            pokerList.sort(function(a, b){
                return b.sortValue - a.sortValue;
            });

            // 显示抢地主按钮
            if(msgBean.qiangDizhu){
                self.buqiangButton.node.active = true;
                self.qiangButton.node.active = true;
            }


            var myNodeScript = myNode.getComponent('MyNodeScript');
            myNodeScript.displayPokers(pokerList, pokerSpriteFrameMap);

            // //显示出牌按钮
            // if(msgBean.command){
            //     console.log(JSON.stringify(msgBean.command));
            //     playButton.node.active = true;
            // }
        });
        //抢地主结束
        Grobal.socket.on(Grobal.playerName + 'qiangEnd', function(msg){
            console.log('qiangEnd:', msg);
            var msgBean = eval('(' + msg + ')');
            //显示地主牌
            self.displayPokers(msgBean.dizhuPokers, self.dizhuNode, pokerPrefab, pokerSpriteFrameMap);

             //显示出牌按钮
            if(msgBean.command){
                console.log(JSON.stringify(msgBean.command));
                playButton.node.active = true;
            }
            
            //将地主牌加入到玩家牌
            if(msgBean.isDizhu){
                for(let i in msgBean.dizhuPokers){
                    Grobal.allPokers.push(msgBean.dizhuPokers[i]);
                    Grobal.allPokers.sort(function(a, b){
                        return b.sortValue - a.sortValue;
                    });
                    var myNodeScript = myNode.getComponent('MyNodeScript');
                    myNodeScript.displayPokers(Grobal.allPokers, pokerSpriteFrameMap);
                }
            }
        });
        //监听抢地主
        Grobal.socket.on(Grobal.playerName + 'qiangdizhu', function(msg){
            
            // 显示抢地主按钮
            self.buqiangButton.node.active = true;
            self.qiangButton.node.active = true;
        });


        // 发送准备好的消息
        Grobal.socket.emit('ready', Grobal.playerName+','+Grobal.roomNum);

        // 出牌不成功
        Grobal.socket.on('playError', function(msg){
            alert(msg);
        });
        //出牌成功
        Grobal.socket.on('playSuccess', function(msg){
            console.log(msg);
            //移除选择的牌，隐藏出牌按钮， 重新渲染牌列表
            playButton.node.active = false;
            passButton.node.active = false;
            
            if(!Grobal.isPass)//点pass的时候不用移除
                self.removePokers(Grobal.allPokers, Grobal.selectPokers);

            Grobal.selectPokers.splice(0, Grobal.selectPokers.length);
            
            // self.displayPokers(Grobal.allPokers, myNode, pokerPrefab, pokerSpriteFrameMap);
            var myNodeScript = myNode.getComponent('MyNodeScript');
            myNodeScript.displayPokers(Grobal.allPokers, pokerSpriteFrameMap);
        });
        //游戏结束
        Grobal.socket.on(Grobal.roomNum + 'gameOver', function(msg){
            console.log(msg);
            playButton.node.active = false;
            passButton.node.active = false;
            readyButton.node.active = true;

            //清掉牌
            Grobal.allPokers.splice(0, Grobal.allPokers.length);
            Grobal.selectPokers.splice(0, Grobal.selectPokers.length);
        });

        // 监听出牌
        Grobal.socket.on(Grobal.playerName + 'play', function(msg){
            console.log('play:' + msg);
            // 
            var msgBean = eval('(' + msg + ')');
            var command = msgBean.command;
            var playType = msgBean.playType;
            var pokerList = msgBean.pokerList;

            displayNode.removeAllChildren();

            if('lead' == command){//出牌
                playButton.node.active = true;
                passButton.node.active = false;
            }
            else{ //跟牌
                playButton.node.active = true;
                passButton.node.active = true;
            }
        });
        //监听玩家状态
        Grobal.socket.on(Grobal.roomNum + 'play', function(msg){
            console.log('play:' + msg);
            // 
            var msgBean = eval('(' + msg + ')');

            var myIndex = Grobal.roomIndex;
            var leftIndex = (myIndex+2)%3;
            var rightIndex = (myIndex+1)%3;

            var leftNum = msgBean[leftIndex];
            var rightNum = msgBean[rightIndex];

            self.updateLeftAndRightPokerNum(leftNum, rightNum);
            self.updateOutPokers(msgBean.currPlay, pokerPrefab, pokerSpriteFrameMap);
        });
    },

    playBCallBack: function(){
        if(Grobal.selectPokers.length == 0){
            alert('请选择要出的牌');
        }
        else{
            var msg = {};
            msg.pokerList = Grobal.selectPokers;
            msg.playerName = Grobal.playerName;
            msg.isPass = false;
            Grobal.isPass = msg.isPass;
            Grobal.socket.emit('play', JSON.stringify(msg));
        }
    },
    /**双击把所选牌归位 */
    nodeDoubleClickCallBack : function(event){
        var currentTime = new Date().valueOf();
        // console.log(currentTime);

        var preClickTime = this.clickTimeArray.pop();
        if(preClickTime){//不为空，则对比时间差
            // console.log('time : ', currentTime - preClickTime);
            if(currentTime - preClickTime < 200){
                // console.log('double click');
                this.myNode.getComponent('MyNodeScript').pokerAllDown();
            }
            else
                this.clickTimeArray.push(currentTime);    
        }
        else//为空则入栈
            this.clickTimeArray.push(currentTime);

    },
    passCallBack: function(){
        var msg = {};
        // msg.pokerList = Grobal.selectPokers;
        msg.playerName = Grobal.playerName;
        msg.isPass = true;
        Grobal.isPass = msg.isPass;
        Grobal.socket.emit('play', JSON.stringify(msg));
        this.readyButton.node.active = false;
    },
    readyCallBack: function(){
        // 发送准备好的消息
        Grobal.socket.emit('ready', Grobal.playerName+','+Grobal.roomNum);

        this.readyButton.node.active = false;
        this.leftDisplayNode.removeAllChildren();
        this.rightDisplayNode.removeAllChildren();
    },
    buqiangCallBack: function(){
        var msgBean = {};
        msgBean.playerName = Grobal.playerName;
        msgBean.roomNum = Grobal.roomNum;
        msgBean.qiangdizhu = false;
        Grobal.socket.emit('qiangdizhu', JSON.stringify(msgBean));
        this.buqiangButton.node.active = false;
        this.qiangButton.node.active = false;
    },
    qiangCallBack: function(){
        var msgBean = {};
        msgBean.playerName = Grobal.playerName;
        msgBean.roomNum = Grobal.roomNum;
        msgBean.qiangdizhu = true;
        Grobal.socket.emit('qiangdizhu', JSON.stringify(msgBean));
        this.buqiangButton.node.active = false;
        this.qiangButton.node.active = false;
    },
    // 显示牌
    displayPokers: function(pokerList, pnode, pokerPrefab, pokerSpriteFrameMap){
        pnode.removeAllChildren();

        var startx = pokerList.length/2;//开始x坐标
        for(var i = 0; i < pokerList.length; i++){
            var poker = pokerList[i]
            var pokerName = poker.name;
            // console.log(pokerName);

            var pokerSprite = cc.instantiate(pokerPrefab);
            pokerSprite.getComponent(cc.Sprite).spriteFrame = pokerSpriteFrameMap[pokerName];

            var gap = 18;//牌间隙
            pokerSprite.setScale(0.8, 0.8);

            pnode.addChild(pokerSprite);
            var x = (-startx)*gap + i*gap;
            // console.log(x);
            pokerSprite.setPosition(x, 0);      
        }
    },
    updateLeftAndRightPokerNum: function(leftNum, rightNum){
        this.displayBackPokers(this.leftHandPokerNode, leftNum);
        this.displayBackPokers(this.rightHandPokerNode, rightNum);
    },
    displayBackPokers: function(handPokerNode, num){
        var backPrefabs = handPokerNode.getComponents(cc.Prefab);
        if(backPrefabs){
            for(var i = 0; i < backPrefabs.length; i++)
                this.backPrefabPool.put(backPrefabs[i]);
        }
        //移除
        handPokerNode.removeAllChildren();

        for(var i = 0; i < num; i++){
            var back = null;
            if(this.backPrefabPool.size() > 0){
                back = this.backPrefabPool.get();
            }
            else{
                back = cc.instantiate(this.backPrefab);
            }

            handPokerNode.addChild(back);
            back.setPosition(0, i*(-10));

            if(i == num - 1){
                this.addLabel(handPokerNode, num, (i+1)*(-11) - back.height/2);
            }
        }
    },
    updateOutPokers: function(roomPlay, pokerPrefab, pokerSpriteFrameMap){
        if(!roomPlay)
            return;

        var myIndex = Grobal.roomIndex;
        var leftIndex = (myIndex+2)%3;
        var rightIndex = (myIndex+1)%3;

        var pokerList = roomPlay.pokerList;
        var playType = roomPlay.playType;
        //更新当前玩家出牌
        var updateNode = null;
        if(roomPlay.index == myIndex){
            updateNode = this.displayNode;
            console.log('my display');
        }
        else if(leftIndex == roomPlay.index){
            updateNode = this.leftDisplayNode;
            console.log('left display');
        }
        else{
            updateNode = this.rightDisplayNode;
            console.log('right display');
        }

        
        if('pass' == playType){
            updateNode.removeAllChildren();
            this.addLabel(updateNode);
        }
        else{
            this.displayPokers(pokerList, updateNode, pokerPrefab, pokerSpriteFrameMap);
        }
    },

    addLabel: function(displayNode, string, y){
        var labelNode = new cc.Node('msg label');
        var label = labelNode.addComponent(cc.Label);
        label.string = '不出!';
        if(string)
            label.string = string;
        if(y)
            labelNode.y = y;

        displayNode.addChild(labelNode)
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    removePokers: function(a, b) { // 差集 a - b
        var map = {};
        for(var i = 0; i < b.length; i++){
            var poker = b[i];
            map[poker.name] = poker;
        }
        var flag = true;
        while(flag){
            var index = -1;
            for(var i = 0; i < a.length; i++){
                var poker = a[i];
                if(map[poker.name]){
                    index = i;
                    flag = true;
                    break;
                }
            }

            if(index == -1)
                flag = false;
            else
                a.splice(index, 1);
        }
    }
});
