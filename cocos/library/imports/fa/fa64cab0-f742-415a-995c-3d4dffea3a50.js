"use strict";
cc._RF.push(module, 'fa64cqw90JBWplcPU3/6jpQ', 'game');
// scripts/game.js

'use strict';

var ROWS = 4; // 行数
var NUMBERS = [2, 4]; // 随机生成的数字
var MIN_LENGTH = 50; // 最起码拖动的长度
var MOVE_DURATION = 0.1; // 移动的时长

cc.Class({
    extends: cc.Component,

    properties: {
        scoreLabel: cc.Label,
        score: 0,

        maxScoreLabel: cc.Label,
        maxScore: 0,

        blockPrefab: cc.Prefab,
        gap: 20,
        bg: cc.Node,
        gameOverNode: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function start() {
        this.drawBgBlocks();
        this.init();
        this.addEventHandler();
    },
    drawBgBlocks: function drawBgBlocks() {
        this.blockSize = (cc.winSize.width - this.gap * (ROWS + 1)) / ROWS;
        var x = this.gap + this.blockSize / 2;
        var y = this.blockSize;
        this.positions = [];
        for (var i = 0; i < ROWS; ++i) {
            this.positions.push([0, 0, 0, 0]);
            for (var j = 0; j < ROWS; ++j) {
                var block = cc.instantiate(this.blockPrefab);
                block.width = this.blockSize;
                block.height = this.blockSize;
                this.bg.addChild(block);
                block.setPosition(cc.p(x, y));
                this.positions[i][j] = cc.p(x, y);
                x += this.gap + this.blockSize;
                block.getComponent('block').setNumber(0);
            }
            y += this.gap + this.blockSize;
            x = this.gap + this.blockSize / 2;
        }
    },
    init: function init() {
        var _this = this;

        this.updateScore(0);

        if (this.blocks) {
            for (var i = 0; i < this.blocks.length; ++i) {
                for (var j = 0; j < this.blocks[i].length; ++j) {
                    if (this.blocks[i][j] != null) {
                        this.blocks[i][j].destroy();
                    }
                }
            }
        }

        this.data = [];
        this.blocks = [];
        for (var _i = 0; _i < ROWS; ++_i) {
            this.blocks.push([null, null, null, null]);
            this.data.push([0, 0, 0, 0]);
        }

        this.addBlock();
        this.addBlock();
        this.addBlock();

        // 获取用户分数
        WeChat.onSearchScore(function (res) {
            var number = res ? res.maxScore : 0;

            _this.maxScore = number;
            _this.maxScoreLabel.string = '个人最高分数：' + number;
        });
    },
    updateScore: function updateScore(number) {
        this.score = number;
        this.scoreLabel.string = '当前分数：' + number;
    },


    /**
     * 找出空闲的块
     * @return 空闲块的位置表示
     */
    getEmptyLocations: function getEmptyLocations() {
        var locations = [];
        for (var i = 0; i < this.blocks.length; ++i) {
            for (var j = 0; j < this.blocks[i].length; ++j) {
                if (this.blocks[i][j] == null) {
                    locations.push({
                        x: i,
                        y: j
                    });
                }
            }
        }
        return locations;
    },
    addBlock: function addBlock() {
        var locations = this.getEmptyLocations();
        if (locations.length == 0) return false;
        // let location = locations[Math.floor(cc.random0To1() * locations.length)];
        var location = locations[Math.floor(Math.random() * locations.length)];
        var x = location.x;
        var y = location.y;
        var position = this.positions[x][y];
        var block = cc.instantiate(this.blockPrefab);
        block.width = this.blockSize;
        block.height = this.blockSize;
        this.bg.addChild(block);
        block.setPosition(position);
        var number = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
        block.getComponent('block').setNumber(number);
        this.blocks[x][y] = block;
        this.data[x][y] = number;
        return true;
    },
    addEventHandler: function addEventHandler() {
        var _this2 = this;

        this.bg.on('touchstart', function (event) {
            _this2.startPoint = event.getLocation();
        });

        this.bg.on('touchend', function (event) {
            _this2.touchEnd(event);
        });

        this.bg.on('touchcancel', function (event) {
            _this2.touchEnd(event);
        });
    },
    touchEnd: function touchEnd(event) {
        this.endPoint = event.getLocation();

        // let vec = cc.pSub(this.endPoint, this.startPoint);
        var vec = this.endPoint.sub(this.startPoint);
        // if (cc.pLength(vec) > MIN_LENGTH) {
        if (vec.mag() > MIN_LENGTH) {
            if (Math.abs(vec.x) > Math.abs(vec.y)) {
                // 水平方向
                if (vec.x > 0) {
                    this.moveRight();
                } else {
                    this.moveLeft();
                }
            } else {
                // 竖直方向
                if (vec.y > 0) {
                    this.moveUp();
                } else {
                    this.moveDown();
                }
            }
        }
    },
    checkFail: function checkFail() {
        for (var i = 0; i < ROWS; ++i) {
            for (var j = 0; j < ROWS; ++j) {
                var n = this.data[i][j];
                if (n == 0) return false;
                if (j > 0 && this.data[i][j - 1] == n) return false;
                if (j < ROWS - 1 && this.data[i][j + 1] == n) return false;
                if (i > 0 && this.data[i - 1][j] == n) return false;
                if (i < ROWS - 1 && this.data[i + 1][j] == n) return false;
            }
        }
        return true;
    },
    gameOver: function gameOver() {
        this.gameOverNode.active = true;
        WeChat.onUpdateScore(this.score);
    },
    afterMove: function afterMove(hasMoved) {
        if (hasMoved) {
            this.updateScore(this.score + 1);
            this.addBlock();
        }
        if (this.checkFail()) {
            this.gameOver();
        }
    },


    /**
     * 移动格子
     * @param {cc.Node} block 待移动块
     * @param {cc.p} position  块的位置
     * @param {func} callback 移动完回调
     */
    doMove: function doMove(block, position, callback) {
        var action = cc.moveTo(MOVE_DURATION, position);
        var finish = cc.callFunc(function () {
            callback && callback();
        });
        block.runAction(cc.sequence(action, finish));
    },


    /**
     * 合并操作
     * @param {cc.Node} b1 块1
     * @param {cc.Node} b2 块2
     * @param {int} num 新的数值
     * @param {Func} callback 完成后回调
     */
    doMerge: function doMerge(b1, b2, num, callback) {
        b1.destroy(); // 合并后销毁
        var scale1 = cc.scaleTo(0.1, 1.1);
        var scale2 = cc.scaleTo(0.1, 1);
        var mid = cc.callFunc(function () {
            b2.getComponent('block').setNumber(num);
        });
        var finished = cc.callFunc(function () {
            callback && callback();
        });
        b2.runAction(cc.sequence(scale1, mid, scale2, finished));
    },
    moveLeft: function moveLeft() {
        var _this3 = this;

        cc.log('move left');
        var hasMoved = false;
        var move = function move(x, y, callback) {
            if (y == 0 || _this3.data[x][y] == 0) {
                callback && callback();
                return;
            } else if (_this3.data[x][y - 1] == 0) {
                // 移动
                var block = _this3.blocks[x][y];
                var position = _this3.positions[x][y - 1];
                _this3.blocks[x][y - 1] = block;
                _this3.data[x][y - 1] = _this3.data[x][y];
                _this3.data[x][y] = 0;
                _this3.blocks[x][y] = null;
                _this3.doMove(block, position, function () {
                    move(x, y - 1, callback);
                });
                hasMoved = true;
            } else if (_this3.data[x][y - 1] == _this3.data[x][y]) {
                // 合并
                var _block = _this3.blocks[x][y];
                var _position = _this3.positions[x][y - 1];
                _this3.data[x][y - 1] *= 2;
                _this3.data[x][y] = 0;
                _this3.blocks[x][y] = null;
                _this3.doMove(_block, _position, function () {
                    _this3.doMerge(_block, _this3.blocks[x][y - 1], _this3.data[x][y - 1], function () {
                        callback && callback();
                    });
                });
                hasMoved = true;
            } else {
                callback && callback();
                return;
            }
        };

        var toMove = [];
        for (var i = 0; i < ROWS; ++i) {
            for (var j = 0; j < ROWS; ++j) {
                if (this.data[i][j] != 0) {
                    toMove.push({ x: i, y: j });
                }
            }
        }

        var counter = 0;
        for (var _i2 = 0; _i2 < toMove.length; ++_i2) {
            move(toMove[_i2].x, toMove[_i2].y, function () {
                counter++;
                if (counter == toMove.length) {
                    _this3.afterMove(hasMoved);
                }
            });
        }
    },
    moveRight: function moveRight() {
        var _this4 = this;

        cc.log('move right');
        var hasMoved = false;
        var move = function move(x, y, callback) {
            if (y == ROWS - 1 || _this4.data[x][y] == 0) {
                callback && callback();
                return;
            } else if (_this4.data[x][y + 1] == 0) {
                // 移动
                var block = _this4.blocks[x][y];
                var position = _this4.positions[x][y + 1];
                _this4.blocks[x][y + 1] = block;
                _this4.data[x][y + 1] = _this4.data[x][y];
                _this4.data[x][y] = 0;
                _this4.blocks[x][y] = null;
                _this4.doMove(block, position, function () {
                    move(x, y + 1, callback);
                });
                hasMoved = true;
            } else if (_this4.data[x][y + 1] == _this4.data[x][y]) {
                // 合并
                var _block2 = _this4.blocks[x][y];
                var _position2 = _this4.positions[x][y + 1];
                _this4.data[x][y + 1] *= 2;
                _this4.data[x][y] = 0;
                _this4.blocks[x][y] = null;
                _this4.doMove(_block2, _position2, function () {
                    _this4.doMerge(_block2, _this4.blocks[x][y + 1], _this4.data[x][y + 1], function () {
                        callback && callback();
                    });
                });
                hasMoved = true;
            } else {
                callback && callback();
                return;
            }
        };

        var toMove = [];
        for (var i = 0; i < ROWS; ++i) {
            for (var j = ROWS - 1; j >= 0; --j) {
                if (this.data[i][j] != 0) {
                    toMove.push({ x: i, y: j });
                }
            }
        }

        var counter = 0;
        for (var _i3 = 0; _i3 < toMove.length; ++_i3) {
            move(toMove[_i3].x, toMove[_i3].y, function () {
                counter++;
                if (counter == toMove.length) {
                    _this4.afterMove(hasMoved);
                }
            });
        }
    },
    moveUp: function moveUp() {
        var _this5 = this;

        cc.log('move up');

        var hasMoved = false;
        var move = function move(x, y, callback) {
            if (x == ROWS - 1 || _this5.data[x][y] == 0) {
                callback && callback();
                return;
            } else if (_this5.data[x + 1][y] == 0) {
                // 移动
                var block = _this5.blocks[x][y];
                var position = _this5.positions[x + 1][y];
                _this5.blocks[x + 1][y] = block;
                _this5.data[x + 1][y] = _this5.data[x][y];
                _this5.data[x][y] = 0;
                _this5.blocks[x][y] = null;
                _this5.doMove(block, position, function () {
                    move(x + 1, y, callback);
                });
                hasMoved = true;
            } else if (_this5.data[x + 1][y] == _this5.data[x][y]) {
                // 合并
                var _block3 = _this5.blocks[x][y];
                var _position3 = _this5.positions[x + 1][y];
                _this5.data[x + 1][y] *= 2;
                _this5.data[x][y] = 0;
                _this5.blocks[x][y] = null;
                _this5.doMove(_block3, _position3, function () {
                    _this5.doMerge(_block3, _this5.blocks[x + 1][y], _this5.data[x + 1][y], function () {
                        callback && callback();
                    });
                });
                hasMoved = true;
            } else {
                callback && callback();
                return;
            }
        };

        var toMove = [];
        for (var i = ROWS - 1; i >= 0; --i) {
            for (var j = 0; j < ROWS; ++j) {
                if (this.data[i][j] != 0) {
                    toMove.push({ x: i, y: j });
                }
            }
        }

        var counter = 0;
        for (var _i4 = 0; _i4 < toMove.length; ++_i4) {
            move(toMove[_i4].x, toMove[_i4].y, function () {
                counter++;
                if (counter == toMove.length) {
                    _this5.afterMove(hasMoved);
                }
            });
        }
    },
    moveDown: function moveDown() {
        var _this6 = this;

        cc.log('move down');

        var hasMoved = false;
        var move = function move(x, y, callback) {
            if (x == 0 || _this6.data[x][y] == 0) {
                callback && callback();
                return;
            } else if (_this6.data[x - 1][y] == 0) {
                // 移动
                var block = _this6.blocks[x][y];
                var position = _this6.positions[x - 1][y];
                _this6.blocks[x - 1][y] = block;
                _this6.data[x - 1][y] = _this6.data[x][y];
                _this6.data[x][y] = 0;
                _this6.blocks[x][y] = null;
                _this6.doMove(block, position, function () {
                    move(x - 1, y, callback);
                });
                hasMoved = true;
            } else if (_this6.data[x - 1][y] == _this6.data[x][y]) {
                // 合并
                var _block4 = _this6.blocks[x][y];
                var _position4 = _this6.positions[x - 1][y];
                _this6.data[x - 1][y] *= 2;
                _this6.data[x][y] = 0;
                _this6.blocks[x][y] = null;
                _this6.doMove(_block4, _position4, function () {
                    _this6.doMerge(_block4, _this6.blocks[x - 1][y], _this6.data[x - 1][y], function () {
                        callback && callback();
                    });
                });
                hasMoved = true;
            } else {
                callback && callback();
                return;
            }
        };

        var toMove = [];
        for (var i = 0; i < ROWS; ++i) {
            for (var j = 0; j < ROWS; ++j) {
                if (this.data[i][j] != 0) {
                    toMove.push({ x: i, y: j });
                }
            }
        }

        var counter = 0;
        for (var _i5 = 0; _i5 < toMove.length; ++_i5) {
            move(toMove[_i5].x, toMove[_i5].y, function () {
                counter++;
                if (counter == toMove.length) {
                    _this6.afterMove(hasMoved);
                }
            });
        }
    },

    // 点击重新开始
    restart: function restart() {
        this.init();
        this.gameOverNode.active = false;
    }
});

cc._RF.pop();