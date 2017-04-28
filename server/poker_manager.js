
/**
 * Module exports.
 */

module.exports = PokerManager;


/**
 * PokerManager constructor.
 *
 * @param
 */
function PokerManager(){
	this.genAllPokers();
}

/**
*	洗牌
*	返回 map
*/
PokerManager.prototype.genAllPokers = function(){
	var pokerList = shuffle();
	var p1List = new Array();//玩家0，1，2的牌
	var p2List = new Array();
	var p3List = new Array();
	var p4List = new Array();//抢地主的三张牌

	for (var i = 0; i < 17; i++) {
		p1List.push(pokerList[i]);
	}
	for (var i = 17; i < 34; i++) {
		p2List.push(pokerList[i]);
	}
	for (var i = 34; i < 51; i++) {
		p3List.push(pokerList[i]);
	}
	for (var i = 51; i < 54; i++) {
		p4List.push(pokerList[i]);
	}

	var map = {};
	map[0] = p1List;
	map[1] = p2List;
	map[2] = p3List;
	map[3] = p4List;

	return map;
};



var ColourType = {
	heitao:'heitao',
	hongxin:'hongxin',
	meihua:'meihua',
	fangzhuan:'fangzhuan',
	dawang:'dawang',
	xiaowang:'xiaowang'
};

function Poker(colourType, num){
	this.colourType = colourType;
	this.num = num;
	this.name = colourType + '_' + num;

	/**
	 * 牌大小值
	 * 同一个num的值一样大，出王外
	 * @return
	 */
	var value = 0;
	if(this.num >= 3 && this.num <= 13)
		value = this.num;
	else if(this.num == 0){//
		value = this.colourType == ColourType.dawang ? 17 : 16;
	}
	else if(this.num == 1){
		value = 14;
	}
	else if(this.num == 2){
		value = 15;
	}
	this.value = value;


	/**
	* 排序大小
	*/
	var sortValue = 0;
	if(this.colourType == ColourType.dawang || this.colourType == ColourType.xiaowang){
		sortValue = this.value;
	}
	else if(this.colourType == ColourType.heitao){
		sortValue = this.value + 0.4;	
	}
	else if(this.colourType == ColourType.hongxin){
		sortValue = this.value + 0.3;	
	}
	else if(this.colourType == ColourType.meihua){
		sortValue = this.value + 0.2;	
	}
	else{
		sortValue = this.value + 0.1;		
	}
	this.sortValue = sortValue;
}

// 洗牌
function shuffle(){
	var list = new Array();

	list.push(new Poker(ColourType.dawang, 0));
	list.push(new Poker(ColourType.xiaowang, 0));

	for(var i = 1; i <= 4; i++){
		var type = '';
		if(i==1)
			type = ColourType.heitao;
		else if(i==2)
			type = ColourType.hongxin;
		else if(i==3)
			type = ColourType.meihua;
		else
			type = ColourType.fangzhuan;

		for (var j = 1; j <= 13; j++) {
			list.push(new Poker(type, j));
		}
	}

	list.shuffle();

	return list;
}

//数组洗牌
Array.prototype.shuffle = function() {
	var input = this;
	for (var i = input.length-1; i >=0; i--) {
		var randomIndex = Math.floor(Math.random()*(i+1)); 
		var itemAtIndex = input[randomIndex]; 
		input[randomIndex] = input[i]; 
		input[i] = itemAtIndex;
	}
	return input;
}

// ======== test ==========

// var list = shuffle();
// console.log(JSON.stringify(list));

// var pm = new PokerManager();
// var map = pm.genAllPokers();
// console.log(JSON.stringify(map));

// console.log(-1%3);



// var PokerPlayHelp = require('./poker_play');
// var pokerList = new Array();

// 单个
// var poker1 = new Poker(ColourType.meihua, 3);
// pokerList.push(poker1);

// 一对
// var poker1 = new Poker(ColourType.meihua, 3);
// var poker2 = new Poker(ColourType.heitao, 3);
// pokerList.push(poker1);
// pokerList.push(poker2);

// 三个
// var poker1 = new Poker(ColourType.meihua, 3);
// var poker2 = new Poker(ColourType.heitao, 3);
// var poker3 = new Poker(ColourType.fangzhuan, 3);
// var poker4 = new Poker(ColourType.heitao, 4);
// var poker5 = new Poker(ColourType.hongxin, 4);
// pokerList.push(poker1);
// pokerList.push(poker2);
// pokerList.push(poker3);
// pokerList.push(poker4);
// pokerList.push(poker5);


// 王炸
// var poker1 = new Poker(ColourType.dawang, 0);
// var poker2 = new Poker(ColourType.xiaowang, 0);
// pokerList.push(poker1);
// pokerList.push(poker2);
// 炸弹
// var poker1 = new Poker(ColourType.meihua, 3);
// var poker2 = new Poker(ColourType.heitao, 3);
// var poker3 = new Poker(ColourType.fangzhuan, 3);
// var poker4 = new Poker(ColourType.hongxin, 3);

// pokerList.push(poker1);
// pokerList.push(poker2);
// pokerList.push(poker3);
// pokerList.push(poker4);

//四个
// var poker1 = new Poker(ColourType.meihua, 3);
// var poker2 = new Poker(ColourType.heitao, 3);
// var poker3 = new Poker(ColourType.fangzhuan, 3);
// var poker4 = new Poker(ColourType.hongxin, 3);
// var poker5 = new Poker(ColourType.hongxin, 8);
// var poker6 = new Poker(ColourType.hongxin, 9);

// pokerList.push(poker1);
// pokerList.push(poker2);
// pokerList.push(poker3);
// pokerList.push(poker4);
// pokerList.push(poker5);
// pokerList.push(poker6);

//顺子
// var poker1 = new Poker(ColourType.meihua, 3);
// var poker2 = new Poker(ColourType.heitao, 4);
// var poker3 = new Poker(ColourType.fangzhuan, 5);
// var poker4 = new Poker(ColourType.hongxin, 6);
// var poker5 = new Poker(ColourType.hongxin, 7);
// var poker6 = new Poker(ColourType.hongxin, 8);

// pokerList.push(poker1);
// pokerList.push(poker2);
// pokerList.push(poker3);
// pokerList.push(poker4);
// pokerList.push(poker5);
// pokerList.push(poker6);

// 连对
// var poker1 = new Poker(ColourType.meihua, 3);
// var poker2 = new Poker(ColourType.heitao, 3);
// var poker3 = new Poker(ColourType.fangzhuan, 4);
// var poker4 = new Poker(ColourType.hongxin, 4);
// var poker5 = new Poker(ColourType.hongxin, 5);
// var poker6 = new Poker(ColourType.heitao, 5);

// pokerList.push(poker1);
// pokerList.push(poker2);
// pokerList.push(poker3);
// pokerList.push(poker4);
// pokerList.push(poker5);
// pokerList.push(poker6);


// 飞机
// var poker1 = new Poker(ColourType.meihua, 3);
// var poker2 = new Poker(ColourType.heitao, 3);
// var poker3 = new Poker(ColourType.fangzhuan, 3);
// var poker4 = new Poker(ColourType.fangzhuan, 4);
// var poker5 = new Poker(ColourType.hongxin, 4);
// var poker6 = new Poker(ColourType.heitao, 4);
// var poker7 = new Poker(ColourType.hongxin, 5);
// var poker8 = new Poker(ColourType.heitao, 5);

// pokerList.push(poker1);
// pokerList.push(poker2);
// pokerList.push(poker3);
// pokerList.push(poker4);
// pokerList.push(poker5);
// pokerList.push(poker6);
// pokerList.push(poker7);
// pokerList.push(poker8);

// try{
// 	var pph = new PokerPlayHelp();
// 	var pw = pph.getPokerWraper(pokerList);
// 	console.log('pw : ' + JSON.stringify(pw));	
// } catch(err){
// 	err;

// 	console.log(err);
// }



