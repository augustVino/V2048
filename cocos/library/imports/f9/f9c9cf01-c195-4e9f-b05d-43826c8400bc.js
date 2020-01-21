"use strict";
cc._RF.push(module, 'f9c9c8BwZVOn7BdQ4JshAC8', 'block');
// scripts/block.js

'use strict';

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

cc.Class({
    extends: cc.Component,

    properties: {
        numberLabel: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function start() {},
    setNumber: function setNumber(number) {
        if (number == 0) {
            this.numberLabel.node.active = false;
        }
        this.numberLabel.string = number;
        if (number in _colors2.default) {
            this.node.color = _colors2.default[number];
        }
    }

    // update (dt) {},

});

cc._RF.pop();