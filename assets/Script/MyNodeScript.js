const POSITION_UP = 1;
const POSITION_DOWN = 2;
cc.Class({
    extends: cc.Component,

    properties: {
        pokerPrefab: {
            default: null,
            type: cc.Prefab
        },
        backPrefab: {
            default: null,
            type: cc.Prefab
        },
        _pokerSpriteList: null,
        _touchStart: null,
        _touchMove: null
    },

    // use this for initialization
    onLoad: function () {
        console.log('mynode on load.');
        this.node.on(cc.Node.EventType.TOUCH_START, this.startCallback, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.endCallback, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.moveCallback, this);
    },

    /**显示牌 */
    displayPokers: function(pokerList, pokerSpriteFrameMap){
        this.node.removeAllChildren();
        this._pokerSpriteList = new Array();
        // console.log(JSON.stringify(pokerSpriteFrameMap));

        for(var i in pokerList){
            var poker = pokerList[i]
            var pokerName = poker.name;
            // console.log(pokerName);

            var pokerSprite = cc.instantiate(this.pokerPrefab);
            // var pokerSpriteStript = pokerSprite.getComponent('pokerPrefab');
            // pokerSpriteStript.sprite.spriteFrame = pokerSpriteFrameMap[pokerName];
            pokerSprite.getComponent(cc.Sprite).spriteFrame = pokerSpriteFrameMap[pokerName];
            pokerSprite.status = POSITION_DOWN;
            pokerSprite.poker = poker;

            var gap = 30;//牌间隙

            this.node.addChild(pokerSprite);
            // var x = 100*gap + i*gap;
            // pokerSprite.setPosition(x, 0);
            pokerSprite.setPosition(150+i*gap, 100);
            this._pokerSpriteList.push(pokerSprite);
            Grobal.allPokers = pokerList;
        }
    },
    pokerAllDown: function(){
        for(var i in this._pokerSpriteList){
            var pokerSprite  = this._pokerSpriteList[i];
            if(pokerSprite.status === POSITION_UP)
                pokerSprite.y -= 20;

            pokerSprite.status = POSITION_DOWN;
            pokerSprite.isChiose = false;
            pokerSprite.opacity = 255;

            Grobal.selectPokers.splice(0, Grobal.selectPokers.length);
        }
    },

    _getCardForTouch: function(touch){
        for(var i = this._pokerSpriteList.length - 1; i >= 0; i--){// 需要倒序
            var pokerSprite = this._pokerSpriteList[i];
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
            // for (let i = this._pokerSpriteList.length - 1; i >= 0; i--) {
            for(let i in this._pokerSpriteList){
                var sprite = this._pokerSpriteList[i];
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

            for (let i = 0; i < this._pokerSpriteList.length; i++) {
                if (!cc.rectIntersectsRect(this._pokerSpriteList[i].getBoundingBox(), rect)) {
                    this._pokerSpriteList[i].isChiose = false;
                    this._pokerSpriteList[i].opacity = 255;
                }
            }
        }

    },

    startCallback: function(event){
        // console.log('start');
        var touches = event.getTouches();
        var touchLoc = touches[0].getLocation();
        // console.log(touchLoc.x + "," + touchLoc.y)
        this._touchStart = this.node.convertToNodeSpace(touchLoc);//将坐标转换为当前节点坐标
        // console.log(this._touchStart.x + "," + this._touchStart.y)
        this._getCardForTouch(this._touchStart);
    },
    moveCallback: function(event){
        // console.log('move');
        var touches = event.getTouches();
        var touchLoc = touches[0].getLocation();
        this._touchMove = this.node.convertToNodeSpace(touchLoc);//将坐标转换为当前节点坐标
        this._getCardForTouch(this._touchMove);
         //当选过头了，往回拖的时候取消选择
        this._checkSelectCardReserve(this._touchStart, this._touchMove);
    },
    endCallback: function(event){
        // console.log('end');
        for(var i = 0; i < this._pokerSpriteList.length; i++){
            var pokerSprite = this._pokerSpriteList[i];
            
            if (pokerSprite.isChiose) {
                pokerSprite.isChiose = false;
                pokerSprite.opacity = 255;
                if(pokerSprite.status === POSITION_UP){
                    pokerSprite.status = POSITION_DOWN;
                    pokerSprite.y -= 20;

                    //移除所选牌
                    var index = -1;
                    for(var k in Grobal.selectPokers){
                        var selectPoker = Grobal.selectPokers[k];
                        if(selectPoker.name == pokerSprite.poker.name)
                            index = k;
                    }
                    if(index != -1)
                        Grobal.selectPokers.splice(index, 1);
                }
                else{
                    pokerSprite.status = POSITION_UP;
                    pokerSprite.y += 20;

                    //添加选择的牌
                    Grobal.selectPokers.push(pokerSprite.poker);
                }
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
