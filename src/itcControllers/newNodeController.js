const node = require('./models/node');
const stamp = require('../itcModel/itcStamp');

module.exports = function newNodeController(){
    var newStamp = new stamp.Instance();
    var newNode = new node.Instance(newStamp, 1);
    return newNode;
};
