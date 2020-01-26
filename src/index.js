const $ = require('jquery');
const d3 = require('d3');
require('./index.css');
const ItcNodeGraph = require('./forceLayoutForNodeDiagrams');
const itcNodeApi = require('./itcNodeApi');
const itcNode = require('./nodeDiagram');

var svg = d3.select('svg');
var itcLayout;
var nodeWidth = 50;
var heightOfStampValues = 5;
var lastClicked;
var selectedItcNode1;
var selectedItcNode2;
var selectedForceNode1;
var selectedForceNode2;

function clearSelectedNodes() {
    selectedItcNode1 = null;
    selectedItcNode2 = null;
    selectedForceNode1 = null;
    selectedForceNode2 = null;
    d3.select('.node2Selection').classed('node2Selection', false);
    d3.select('.node1Selection').classed('node1Selection', false);
}

var itcNodeData = itcNodeApi.newNode();
    itcLayout = ItcNodeGraph;
    itcLayout.nodeDrawer(drawItcNode);
    itcLayout.nodeWidth(nodeWidth);
    itcLayout.itcNodes([itcNodeData]);
    itcLayout(svg);

function drawItcNode(g, nodeData) {
    var chart = itcNode;
    chart
        .width(nodeWidth)
        .heightOfStampValues(heightOfStampValues)
        .node(nodeData)
        .selectionAction(function(selectedNode, forceNode) {
            $('.selectedNodeInfo').html(getTextForItcNode(forceNode.itcNode));
            d3.select('.currentNode')
                .classed('currentNode', false)
                .attr({
                    stroke: '#111111'
                });
            d3.select(selectedNode)
                .classed('currentNode', true)
                .attr({
                    stroke: '#FF0000'
                });
            if (selectedNode.classList.contains('usedNode')) {
                return;
            }
            if (lastClicked[0].id == 'selectedNode1') {
                d3.selectAll('.node1Selection').classed('node1Selection', false);
                d3.select(selectedNode).classed('node2Selection', false);
                d3.select(selectedNode).classed('node1Selection', true);
                selectedItcNode1 = forceNode.itcNode;
                selectedForceNode1 = selectedNode;
            } else {
                d3.selectAll('.node2Selection').classed('node2Selection', false);
                d3.select(selectedNode).classed('node1Selection', false);
                d3.select(selectedNode).classed('node2Selection', true);
                selectedItcNode2 = forceNode.itcNode;
                selectedForceNode2 = selectedNode;
            }
        });

    chart(g);
}
function getTextForItcNode(itcNode) {
    function getTextForId(itcId) {
        if (itcId.isLeaf) {
            return itcId.value + '';
        }
        return '(' + getTextForId(itcId.left) + ', ' + getTextForId(itcId.right) + ')';
    }
    function getTextForEvent(itcEvent) {
        if (itcEvent.isLeaf) {
            return itcEvent.value;
        }
        return (
            '(' + itcEvent.value + ', ' + getTextForEvent(itcEvent.left) + ', ' + getTextForEvent(itcEvent.right) + ')'
        );
    }
    var text =
        'Id: ' +
        itcNode.id +
        '</br>  Value: ' +
        itcNode.someValue0 +
        '</br> Itc Id: ' +
        getTextForId(itcNode.stamp.itcId) +
        '</br> Itc Event:' +
        getTextForEvent(itcNode.stamp.itcEvent) +
        '</br> Has Conflict: ' +
        itcNode.hasConflict;
    return text;
}

$(function() {
    lastClicked = $('#selectedNode1');
    $('#selectedNode1').click(function() {
        lastClicked = $('#selectedNode1');
    });

    $('#selectedNode2').click(function() {
        lastClicked = $('#selectedNode2');
    });
});

$('#sendAction').click(function() {
    var allNodes = itcLayout.itcNodes();
    var promise;
    var node1Index = allNodes.indexOf(selectedItcNode1);
    var node2Index = allNodes.indexOf(selectedItcNode2);

    var actionType = $('input[name=ItcAction]:radio:checked').val();

    switch (actionType) {
        case 'Event':
            if (!selectedItcNode1) {
                alert('Select a node1 (by clicking it) to perform an event on it.');
                return;
            }
            const itcNodeData = itcNodeApi.nodeEvent(selectedItcNode1);
            d3.select(selectedForceNode1).classed('usedNode', true);
            itcLayout.addItcNode(itcNodeData, node1Index);
            itcLayout.restart();
            clearSelectedNodes();
            break;
        case 'Fork':
            if (!selectedItcNode1) {
                alert('Select a node1 (by clicking it) to perform a fork on it.');
                return;
            }
            const itcNodes = itcNodeApi.fork(selectedItcNode1);
            d3.select(selectedForceNode1).classed('usedNode', true);
            itcLayout.addItcNode(itcNodes.node1, node1Index);
            itcLayout.addItcNode(itcNodes.node2, node1Index);
            itcLayout.restart();
            clearSelectedNodes();
            break;
        case 'Join':
            if (!selectedItcNode1 || !selectedItcNode2) {
                alert('Select a node1 and node2 (by clicking them) to perform a join on them.');
                return;
            }
            if (selectedItcNode1.id == selectedItcNode2.id) {
                alert('You must select two different nodes to join');
                return;
            }
            const itcNode = itcNodeApi.join(selectedItcNode1, selectedItcNode2);
            d3.select(selectedForceNode1).classed('usedNode', true);
            d3.select(selectedForceNode2).classed('usedNode', true);
            itcLayout.addItcNode(itcNode, node1Index, null, node2Index);
            itcLayout.restart();
            clearSelectedNodes();
            break;
        default:
            alert('Select an action type: event, join or fork.');
            break;
    }
});
