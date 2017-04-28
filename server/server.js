var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var PokerManager = require('./poker_manager');
var pm = new PokerManager(); // 扑克管理器

var PokerPlayHelp = require('./poker_play');
var pph = new PokerPlayHelp();


var roomMap = {};//房间号对应的房间
var playerRoomMap = {};//人对应的房间
var playerMap = {}; //人名对应的人

function Player(name, index){
	this.name = name;
	this.index = index;
	this.isPass = false;
	this.pokerList = new Array();
}

function Room(roomNum){
	this.roomNum = roomNum;//房号
	this.playerList = new Array();//玩家列表
	this.readyCount = 0;
	this.join = function(playerName){
		var player = new Player(playerName, this.playerList.length);
		playerMap[playerName] = player;

		this.playerList.push(player);
		playerRoomMap[playerName] = this;
	};
	this.leave = function(player){
		this.playerList.splice(player.index, 1);
	};

	roomMap[this.roomNum] = this;

	this.addReadyCount = function(){
		this.readyCount++;
	};
	this.resetReadyCount = function(){
		this.readyCount = 0;
	};
}

function PlayController(room){
	this.room = room;
	// 正在出牌的序号（0,1,2）
	this.currentPlayingIndex;
	//上一首牌
	this.lastPokers;
	//上一手牌的牌型包装器
	this.lastPokerWraper;
	// 第一手牌
	this.isFirstPoker;
}

var roomControllerMap = {};

var roomArray = new Array();

io.on('connection', function(socket){
	console.log('a user connected');

	//当前回话的玩家名
	var currentName = '';


	//登陆返回clientId
	var clientId = Date.parse(new Date())/1000;
	socket.emit('hello', clientId);

	socket.on('disconnect', function(msg){
		console.log('disconnect：' + currentName);
		var room = playerRoomMap[currentName];
		var player = playerMap[currentName];
		console.log('---' + room);
		if(room != null && player != null){
			room.leave(player);
			var roomNum = room.roomNum;
			io.emit(roomNum+'joinRoom', JSON.stringify(room))
		}
	});
  

	// 创建房间
	socket.on('createRoom', function(msg){
		var playerName = msg;
		currentName = playerName;
		// console.log(clientId + 'creating room .');
		var roomNum = roomArray.length + 1;
		var room = new Room(roomNum);

		roomArray.push(room);

		room.join(playerName);
		console.log('playerRoomMap:' + JSON.stringify(playerRoomMap[playerName]));
		// console.log('room num is ' + JSON.stringify(room));
		socket.emit('createRoom', JSON.stringify(room));
	});	

	// 房间列表
	socket.on('roomList', function(msg){
		socket.emit('roomList', JSON.stringify(roomArray));
	});

	// 加入房间 msg=playerName,roomNum
	socket.on('joinRoom', function(msg){
		console.log('join room:' + msg)
		var arr = msg.split(',');
		var playerName = arr[0];
		var roomNum = arr[1];

		currentName = playerName;

		var room = roomMap[roomNum];
		if(room){
			room.join(playerName);
			// 发送加入房间的消息，全局
			console.log('nitify joinRoom');
			socket.emit('joinRoom', room.playerList.length-1);
			io.emit(roomNum+'joinRoom', JSON.stringify(room));

			//如果够三个人，就开始
			if(room.playerList.length == 3){
				io.emit(roomNum+'gameStart', JSON.stringify(room));
			}
		}
	});

	//准备
	socket.on('ready', function(msg){
		console.log('ready:' + msg)
		var arr = msg.split(',');
		var playerName = arr[0];
		var roomNum = arr[1];

		var room = roomMap[roomNum];
		if(room){
			room.addReadyCount();

			if(room.readyCount == 3){
				var pc = new PlayController(room);
				roomControllerMap[roomNum] = pc;

				//发牌
				var pokerMap = pm.genAllPokers();// 产生54张牌并洗好牌
				var playerList = room.playerList;
				for(var i = 0; i < playerList.length; i++){
					var msgBean = {};
					var pokerList = pokerMap[i];
					var player = playerList[i];
					var dizhuPokers = null;

					// 保存牌到玩家对象中
					player.pokerList = pokerList.slice();

					if(i == 0){
						dizhuPokers = pokerMap[3];
						// console.log('dizhupai: ' + JSON.stringify(dizhuPokers));
						msgBean.command = new Command(CmdType.lead);
						pc.currentPlayingIndex = 0;
						pc.isFirstPoker = true;

						msgBean.dizhuPokers = dizhuPokers;

						for(var j = 0; j < dizhuPokers.length; j++){
							var poker = dizhuPokers[j];
							player.pokerList.push(poker);
						}
					}

					msgBean.pokerList = pokerList;

					//发送给三个玩家牌
					console.log('dealing cards to ' + player.name);
					io.emit(player.name + 'dealingCards', JSON.stringify(msgBean));
				}

				// 通知每个玩家 每个玩家的状态
				var roomMsg = {};
				for(var i = 0; i < room.playerList.length; i++){
					var p = room.playerList[i];
					roomMsg[i] = p.pokerList.length;
				}
				io.emit(room.roomNum + 'play', JSON.stringify(roomMsg));
				
				room.resetReadyCount();
			}
		}

	});

	//
	socket.on('play', function(msg){
		console.log("play: " + msg);
		var msgBean = eval('(' + msg + ')');
		var player = playerMap[msgBean.playerName];
		var pokerList = msgBean.pokerList;
		var isPass = msgBean.isPass;

		player.isPass = isPass;

		if(player){
			var room = playerRoomMap[player.name];
			var pc = roomControllerMap[room.roomNum];
			if(room && pc){
				if(player.index != pc.currentPlayingIndex){//不是当前玩家
					socket.emit('playError', '还不到你出牌');
				}
				else{
					// 
					if(pc.isFirstPoker){//一手牌
						if(!pokerList || pokerList.length == 0){
							socket.emit('playError', '选择你要出的牌');
							return;
						}

						try{
							var pw = pph.getPokerWraper(pokerList);
							console.log('pw : ' + JSON.stringify(pw));
							pc.lastPokerWraper = pw;
						} catch(err){
							// err;
							socket.emit('playError', err);
							console.log(err);
							return;
						}



						//是否已出完牌
						arrayPokerDifference(player.pokerList, pokerList);
						console.log('剩余牌数量： ' + player.pokerList.length);
						if(player.pokerList.length == 0){
							io.emit(room.roomNum + 'gameOver', '游戏结束');
							return;
						}


						socket.emit('playSuccess', 'ok');
						
						// 通知下一家跟牌
						var command = CmdType.follow;
						var playType = PlayType.follow;
						notifyNextPlayer(pc, player, room, pokerList, command, playType);
					}
					else{//跟牌
						// 校验牌型是否一样，是否能管上
							if(!isPass){// 玩家跟牌
								// 校验 TODO
								if(!pokerList || pokerList.length == 0){
								socket.emit('playError', '选择你要出的牌');
								return;
							}

							try{
								//是否能管上
								var result = pc.lastPokerWraper.follow(pokerList);
								if(!result.canFollow){
									socket.emit('playError', '你的牌不够大');
									return;
								}

								pc.lastPokerWraper = result.targetPokerWraper;
							} catch(err){
								// err;
								socket.emit('playError', err);
								console.log(err);
								return;
							}


							//是否已出完牌
							arrayPokerDifference(player.pokerList, pokerList);
							console.log('剩余牌数量： ' + player.pokerList.length);
							if(player.pokerList.length == 0){
								io.emit(room.roomNum + 'gameOver', '游戏结束');
								return;
							}

							socket.emit('playSuccess', 'ok');

							
							// 通知下一家跟牌
							var command = CmdType.follow;
							var playType = PlayType.follow;
							notifyNextPlayer(pc, player, room, pokerList, command, playType);
						}
						else{//通知下一家跟牌或重新出牌
							

							socket.emit('playSuccess', 'ok');

							//判断上一家是否也是过牌，是则通知下一家重新出牌
							var preIndex = (player.index + 2)%3;// +2除以3求余就是上一家的index
							var prePlayer = room.playerList[preIndex];
							var command;
							console.log('preplayer is pass ' + prePlayer.isPass);
							if(prePlayer.isPass)
								command = CmdType.lead;
							else
								command = CmdType.follow;

							var playType = PlayType.pass;

							notifyNextPlayer(pc, player, room, null, command, playType);
						}
					}
				}
			}
		}

		function notifyNextPlayer(pc, player, room, pokerList, command, playType){
			// 通知下一家出牌
			var nextIndex = (player.index + 1)%3;

			var nextPlayer = room.playerList[nextIndex];

			pc.currentPlayingIndex = nextIndex;
			pc.lastPokers = pokerList;
			pc.isFirstPoker = CmdType.lead == command;

			var playMsg = {};
			playMsg.pokerList = pokerList;
			playMsg.command = command;
			playMsg.playType = playType;

			io.emit(nextPlayer.name + 'play', JSON.stringify(playMsg));

			// 通知每个玩家 每个玩家的状态
			var roomMsg = {};
			for(var i = 0; i < room.playerList.length; i++){
				var p = room.playerList[i];
				roomMsg[i] = p.pokerList.length;
			}
			roomMsg.currPlay = {
				index: player.index,
				pokerList: pokerList,
				playType: playType
			}
			io.emit(room.roomNum + 'play', JSON.stringify(roomMsg));
		}
	});


});

// 通知玩家的指令
var CmdType = {
	lead: 'lead',   	//领导出牌
	follow: 'follow'	//跟牌
};

var PlayType = {
	follow: 'follow',	//管上
	pass: 'pass'		//过
}

function Command(cmdType){
	this.cmdType = cmdType;

}

http.listen(3000, function(){
	console.log('listening on *:3000');
});


function arrayPokerDifference(a, b) { // 差集 a - b
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





