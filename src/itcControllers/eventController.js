const node = require('./models/node');

module.exports = function eventController(request) {
    var result = node.deserialize(request);
    result.stamp.createEvent();
    result.value += 1;
    return result;
};
