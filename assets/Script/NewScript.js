const POSITION_UP = 1;
const POSITION_DOWN = 2;

cc.Class({
    extends: cc.Component,

    properties: {
        button: {
            default: null,
            type: cc.Button
        },
        poker: {
           default: null,
           type: cc.Prefab
        },
        pokerSFMap: null,
        clickTimeArray: null,
        pokerNode: {
            default: null,
            type: cc.Node
        },
        pokerSpriteList: null,
        touchStart: null,
        touchMove: null
    },

    // use this for initialization
    onLoad: function () {
        this.clickTimeArray = new Array();
        var labelNode = new cc.Node('msg label');
        var label = labelNode.addComponent(cc.Label);
        label.string = 'hello world!';
        labelNode.setPosition(50, 200);
        this.node.addChild(labelNode);

        var self = this;
        var poker = this.poker;

        this.pokerSpriteList = new Array();

        
        this.node.on(cc.Node.EventType.TOUCH_START, this.nodeDoubleClickCallBack, this);
        // this.pokerNode.on(cc.Node.EventType.TOUCH_MOVE, this.moveCallback, this);

        this.pokerNode.on(cc.Node.EventType.TOUCH_START, this.startCallback, this);
        this.pokerNode.on(cc.Node.EventType.TOUCH_END, this.endCallback, this);
        this.pokerNode.on(cc.Node.EventType.TOUCH_MOVE, this.moveCallback, this);

        cc.loader.loadRes("imgs/poker", cc.SpriteAtlas, function (err, assets) {
            // assets 是一个 SpriteFrame 数组，已经包含了图集中的所有 SpriteFrame。
            // 而 loadRes('test assets/sheep', cc.SpriteAtlas, function (err, atlas) {...}) 获得的则是整个 SpriteAtlas 对象。
            // console.log('---' + err);
            // console.log('====' + assets);
            // cc.SpriteAtlas;

            var ttt = assets.getSpriteFrames();
            // cc.SpriteFrame
            for(var i = 0; i < ttt.length; i++){
                if(i == 18)
                    break;
                var sf = ttt[i];
                
                // console.log(JSON.stringify(sf));
                // console.log(sf._name);

                var pokerSprite = cc.instantiate(poker);
                pokerSprite.getComponent(cc.Sprite).spriteFrame = sf;

                self.pokerNode.addChild(pokerSprite);
                pokerSprite.setPosition(100+i*25, 100);
                pokerSprite.status = POSITION_DOWN;

                self.pokerSpriteList.push(pokerSprite);
            }

        });
    },

    _getCardForTouch: function(touch){
        for(var i = this.pokerSpriteList.length - 1; i >= 0; i--){// 需要倒序
            var pokerSprite = this.pokerSpriteList[i];
            var box = pokerSprite.getBoundingBox();
            if (cc.rectContainsPoint(box, touch)) {
                // console.log('in');
                pokerSprite.isChiose = true;
                pokerSprite.opacity = 185;
                return;//关键， 找到一个就返回
            }
        }
    },
    _checkSelectCardReserve(touchBegan, touchMoved) {
        // console.log('_checkSelectCardReserve');
        var p1 = touchBegan.x < touchMoved.x ? touchBegan : touchMoved;
        
        
        if (p1 === touchMoved) {
            // for (let i = this.pokerSpriteList.length - 1; i >= 0; i--) {
            for(let i in this.pokerSpriteList){
                var sprite = this.pokerSpriteList[i];
                if (p1.x - sprite.x > -25) {  //
                    sprite.opacity = 255;
                    sprite.isChiose = false;
                }
            }
        }
        else{
            var width = Math.abs(touchBegan.x - touchMoved.x);
            var height = Math.abs(touchBegan.y - touchMoved.y) > 5 ? Math.abs(touchBegan.y - touchMoved.y) : 5;
            var rect = cc.rect(p1.x, p1.y, width, height);

            for (let i = 0; i < this.pokerSpriteList.length; i++) {
                if (!cc.rectIntersectsRect(this.pokerSpriteList[i].getBoundingBox(), rect)) {
                    this.pokerSpriteList[i].isChiose = false;
                    this.pokerSpriteList[i].opacity = 255;
                }
            }
        }

    },

    startCallback: function(event){
        // console.log('start');
        var touches = event.getTouches();
        var touchLoc = touches[0].getLocation();
        // console.log(touchLoc.x + "," + touchLoc.y)
        this.touchStart = this.pokerNode.convertToNodeSpace(touchLoc);//将坐标转换为当前节点坐标
        // console.log(this.touchStart.x + "," + this.touchStart.y)
        this._getCardForTouch(this.touchStart);
    },
    moveCallback: function(event){
        console.log('move');
        var touches = event.getTouches();
        var touchLoc = touches[0].getLocation();
        this.touchMove = this.pokerNode.convertToNodeSpace(touchLoc);//将坐标转换为当前节点坐标
        this._getCardForTouch(this.touchMove);
        //当选过头了，往回拖的时候取消选择
        this._checkSelectCardReserve(this.touchStart, this.touchMove);
    },
    endCallback: function(event){
        // console.log('end');
        for(var i = 0; i < this.pokerSpriteList.length; i++){
            var pokerSprite = this.pokerSpriteList[i];
            
            if (pokerSprite.isChiose) {
                pokerSprite.isChiose = false;
                pokerSprite.opacity = 255;
                if(pokerSprite.status === POSITION_UP){
                    pokerSprite.status = POSITION_DOWN;
                    pokerSprite.y -= 20;
                }
                else{
                    pokerSprite.status = POSITION_UP;
                    pokerSprite.y += 20;
                }
            }
        }
    },
    
    nodeDoubleClickCallBack: function(event){
        var currentTime = new Date().valueOf();
        console.log(currentTime);

        var preClickTime = this.clickTimeArray.pop();
        if(preClickTime){//不为空，则对比时间差
            console.log('time : ', currentTime - preClickTime);
            if(currentTime - preClickTime < 200)
                console.log('double click');
            else
                this.clickTimeArray.push(currentTime);    
        }
        else//为空则入栈
            this.clickTimeArray.push(currentTime);

        this.button.node.active = !this.button.node.active; 
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
