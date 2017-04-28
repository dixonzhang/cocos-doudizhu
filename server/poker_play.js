module.exports = PokerPlayHelp;


/**
 * PokerPlayHelp constructor.
 *
 * @param
 */
function PokerPlayHelp(){
}

PokerPlayHelp.prototype.getPokerWraper = function(pokerList){

	console.log('===============')

	if(!pokerList || pokerList.length == 0)
		throw ExceptionType.WRONG_POKER_TYPE;

	var pokerWraper = new PokerWraper(pokerList);

	var pokerMap = new PokerMap();
	for(var i = 0; i < pokerList.length; i++){
		var poker = pokerList[i];
		console.log(JSON.stringify(poker))

		var count = pokerMap[poker.value];
		if(!count){
			count = 0;
		}

		pokerMap[poker.value] = ++count;
	}

	console.log('pokerMap: ' + JSON.stringify(pokerMap));

	var countList = new Array();// 每张相同牌值的数量数组
	for(var pokerValue in pokerMap){
		if(pokerValue != 'size')
			countList.push(pokerMap[pokerValue]);
	}
	
	//倒序
	countList.sort(function(a, b){
		return b - a;
	});

	console.log('countList: ' + JSON.stringify(countList));

	//得到牌型
	var type = '';
	for(var i = 0; i < countList.length; i++){
		var count = countList[i];
		if(count > 4)
			throw ExceptionType.WRONG_POKER_TYPE;

		type += count+'';
	}

	console.log('type:' + type);

	type = type.replace(/1/g, 'a');
	type = type.replace(/2/g, 'b');
	type = type.replace(/3/g, 'c');
	type = type.replace(/4/g, 'd');

	// 处理顺子，可能大于5个，使等于5个
	var pattern = /a+/g;
	var array = pattern.exec(type);
	if(array && array[0].length == type.length && type.length > 5)
		type = 'aaaaa';

	// 处理连对，大于3对时使其等于3对
	var pattern2 = /b+/g;
	var array2 = pattern2.exec(type);
	if(array2 && array2[0].length == type.length && type.length > 3)
		type = 'bbb';

	try{
		console.log('type:' + type);
		var executorKey = Type[type];
		console.log('executorKey:' + executorKey);

		var executor = new Executor();

		// var e = executor['one'];
		// for(var key in executor){
		// 	console.log(key);
		// }

		// console.log(JSON.stringify(e));
		// return this.execute(pokerMap, this, e);
		return executor[executorKey](pokerMap, pokerWraper);
	}catch (err){
		console.log(err);
		throw ExceptionType.WRONG_POKER_TYPE;
	}
}



function PokerWraper(pokerList){
	this.srcList = pokerList;

	this.pokerType;	//牌型
	this.leadValue; //领导牌 配置
	this.size = pokerList.length;		//牌数量
}

/**
*	管上
*	targetPokerList 能否管上当前的PokerWraper的牌
 */
PokerWraper.prototype.follow = function(targetPokerList){
	var canFollow = false;
	var targetPokerWraper = new PokerPlayHelp().getPokerWraper(targetPokerList);

	console.log('this:' + JSON.stringify(this));
	console.log('target:' + JSON.stringify(targetPokerWraper));

	//类型一致
	if(targetPokerWraper.pokerType == this.pokerType){
		if(targetPokerWraper.size != this.size)
			throw '所选牌与上一手牌数量不一致';
		else if(Number(targetPokerWraper.leadValue) <= Number(this.leadValue))
			throw '所选牌必须大于上一手牌';
		else
			canFollow = true;
	}
	else if(PokerType.bomb == targetPokerWraper.pokerType){
		canFollow = true;
	}
	else
		throw ExceptionType.NOT_SAME_POKER_TYPE;

	return {
		canFollow: canFollow,
		targetPokerWraper: targetPokerWraper
	}
}


function PokerMap(){
	this.size();
}

PokerMap.prototype.size = function(){
	var size = 0;
	for(var key in this){
		// console.log(key);
		if('size' != key)
			size ++;
	}
	return size;
}


var PokerType = {
	one: 'one', 
	pair: 'pair', 
	three: 'three',
	four: 'four',
	plane: 'plane', 
	row: 'row', 
	multiPair: 'multiPair', 
	bomb: 'bomb'
}

var ExceptionType = {
	WRONG_POKER_TYPE: '错误的牌型',
	NOT_SAME_POKER_TYPE: '跟上一家牌型不一致'
}

function Executor(){}

/** 炸弹  */
Executor.prototype.bomb = function(map, pokerWraper){
	// console.log('aaa' + p);
	if(map.size() == 2){
		var index = 0;
		for(var pokerValue in map){
			if(pokerValue == 'size')
			continue;
		
			if(pokerValue == 16 || pokerValue == 17)
				index++;
		}
		//王炸
		if(index == 2){
			pokerWraper.leadValue = 16;
			pokerWraper.pokerType = PokerType.bomb;
			pokerWraper.size = 0; //炸弹不用比较size
			return pokerWraper;
		}
		else
			throw ExceptionType.WRONG_POKER_TYPE;
	}

	//普通炸弹 四个一样的牌
	var value = 0;
	for(var pokerValue in map){
		if(pokerValue == 'size')
			continue;
		
		value = pokerValue;
		break;
	}
	pokerWraper.leadValue = pokerValue;
	pokerWraper.pokerType = PokerType.bomb;
	pokerWraper.size = 0; //炸弹不用比较size
	return pokerWraper;
}

/** 四带X  */
Executor.prototype.four = function(map, pokerWraper){
	for(var pokerValue in map){
		if(pokerValue == 'size')
			continue;
		
		var count = map[pokerValue];
		if(count == 4){
			pokerWraper.leadValue = pokerValue;
			pokerWraper.pokerType = PokerType.four;
		}
	}

	if(!pokerWraper.pokerType)
		throw ExceptionType.WRONG_POKER_TYPE;
	else
		return pokerWraper;
}
/**  连对  */
Executor.prototype.multiPair = function(map, pokerWraper){
	var valueList = new Array();
	for(var pokerValue in map){
		if(pokerValue == 'size')
			continue;
		
		valueList.push(pokerValue);
	}

	valueList.sort(function(a, b){
		return a - b;
	});

	//最大的牌值不能大于14（即比A还要大）
	if(valueList[valueList.length - 1] > 14)
		throw ExceptionType.WRONG_POKER_TYPE;

	// 检查是否是顺子
	var valueSum = 0;
	for(var i = 0; i < valueList.length; i++){
		valueSum += Number(valueList[i]);
	}
	// 等差数列求和 (a1+an)*n/2
	var n = valueList.length;
	var a1 = valueList[0];
	var an = valueList[n-1];

	var targetSum = (Number(a1) + Number(an))*n/2;

	if(valueSum == targetSum && (an -a1)/(n-1) == 1){
		pokerWraper.leadValue = a1;
		pokerWraper.pokerType = PokerType.multiPair;
		return pokerWraper;
	}
	else
		throw ExceptionType.WRONG_POKER_TYPE;

}
/**  单张 */
Executor.prototype.one = function(map, pokerWraper){
	
	var size = 0;
	var count = 0;
	var value = 0;
	for(pokerValue in map){
		if(pokerValue == 'size')
			continue;

		value = pokerValue;
		size++;
		count = map[pokerValue];
	}

	if(size == 1 && count == 1){
		pokerWraper.leadValue = value;
		pokerWraper.pokerType = PokerType.one;
		return pokerWraper;
	}
	else
		throw ExceptionType.WRONG_POKER_TYPE;
}
/**  一对 */
Executor.prototype.pair = function(map, pokerWraper){
	var size = 0;
	var count = 0;
	var value = 0;
	for(pokerValue in map){
		if(pokerValue == 'size')
			continue;
		
		value = pokerValue;
		size++;
		count = map[pokerValue];
	}

	if(size == 1 && count == 2){
		pokerWraper.leadValue = value;
		pokerWraper.pokerType = PokerType.pair;
		return pokerWraper;
	}
	else
		throw ExceptionType.WRONG_POKER_TYPE;
}
/**  飞机 */
Executor.prototype.plane = function(map, pokerWraper){
	var valueList = new Array();
	for(var pokerValue in map){
		if(pokerValue == 'size')
			continue;
		
		if(map[pokerValue] == 3)
			valueList.push(pokerValue);
	}

	valueList.sort(function(a, b){
		return a - b;
	});

	//最大的牌值不能大于14（即比A还要大）
	if(valueList[valueList.length - 1] > 14)
		throw ExceptionType.WRONG_POKER_TYPE;

	//检查是否是连续的
	var valueSum = 0;
	for(var i = 0; i < valueList.length; i++){
		valueSum += Number(valueList[i]);
	}
	// 等差数列求和 (a1+an)*n/2
	var n = valueList.length;
	var a1 = valueList[0];
	var an = valueList[n-1];

	var targetSum = (Number(a1) + Number(an))*n/2;

	if(valueSum == targetSum && (an -a1)/(n-1) == 1){
		pokerWraper.leadValue = a1;
		pokerWraper.pokerType = PokerType.plane;
		return pokerWraper;
	}
	else
		throw ExceptionType.WRONG_POKER_TYPE;
}
/**  顺子 */
Executor.prototype.row = function(map, pokerWraper){
	var valueList = new Array();
	for(var pokerValue in map){
		if(pokerValue == 'size')
			continue;
		
		valueList.push(pokerValue);
	}

	valueList.sort(function(a, b){
		return a - b;
	});

	// console.log('valueList:' + valueList);

	//最大的牌值不能大于14（即比A还要大）
	if(valueList[valueList.length - 1] > 14)
		throw ExceptionType.WRONG_POKER_TYPE;

	//检查是否是顺子
	var valueSum = 0;
	for(var i = 0; i < valueList.length; i++){
		valueSum += Number(valueList[i]);
	}
	// 等差数列求和 (a1+an)*n/2
	var n = valueList.length;
	var a1 = valueList[0];
	var an = valueList[n-1];

	var targetSum = (Number(a1) + Number(an))*n/2;

	// console.log(valueSum + ',' + targetSum);

	if(valueSum == targetSum && (an-a1)/(n-1) == 1){
		pokerWraper.leadValue = a1;
		pokerWraper.pokerType = PokerType.row;
		return pokerWraper;
	}
	else
		throw ExceptionType.WRONG_POKER_TYPE;
}
/**  三带X */
Executor.prototype.three = function(map, pokerWraper){
	for(var pokerValue in map){
		if(pokerValue == 'size')
			continue;
		
		var count = map[pokerValue];
		if(count == 3){
			pokerWraper.leadValue = pokerValue;
			pokerWraper.pokerType = PokerType.three;
		}
	}

	if(!pokerWraper.pokerType)
		throw ExceptionType.WRONG_POKER_TYPE;
	else
		return pokerWraper;
}


/**
 * 1	一个
 * 2	一对
 * 3	三个
 * 4	炸弹
 * 11	王炸
 * 31	三带一
 * 32	三带一对
 * 411	四带两
 * 422	四带两对
 * 111111(>=5)	顺子
 * 222(>=3)连队
 * 33	飞机不带
 * 3311	飞机带两个
 * 3322	飞机带两队
 * ...
 * 1=a
 * 2=b
 * 3=c
 * 4=d
 */
 var Type = {
 	a : 'one',
	b : 'pair',
	c : 'three',
	d : 'bomb',
	aa : 'bomb',
	ca : 'three',
	cb : 'three',
	daa : 'four',
	db : 'four',
	dbb : 'four',
	aaaaa : 'row',
	bbb : 'multiPair',
	cc : 'plane',
	ccaa : 'plane',
	ccb : 'plane',
	ccbb : 'plane',
	ccc : 'plane',
	cccaaa : 'plane',
	cccba : 'plane',
	cccbbb : 'plane',
	cccc : 'plane',
	ccccaaaa : 'plane',
	ccccbb : 'plane',
	ccccbaa : 'plane',
	ccccc : 'plane',
	cccccaaaaa : 'plane'
 }
