// defined on sequence
function (callback) {
  var activeNode = this.activeNode,
    core = this.core,
    socket,
    logger = this.logger;

  function setupSocket(serverAddr) {
    require(['/socket.io/socket.io.js'], function(_io) {
      socket = _io(serverAddr);
      logger.info('finished setting up socket connection.')
    })
  }

  function sendCmds(cmds) {
      // socket should be setup globally
      socket.emit('submission', cmds);
      logger.info('sent commands', cmds);
  }

  // returns the targeted robot address
  let getRobotAddress = function(nodes) {
    let node =  nodes.find(node => getMetaName(node) === 'ConnectionParameters')
    let addr = 'http://';
    debugger;
    addr += core.getAttribute(node, 'robotAddress');
    addr += ':';
    addr += core.getAttribute(node, 'portNumber');
    return addr;
  };

  // locate the startNode in a set of nodes
  let findStartNode = function(nodes) {
    // TODO add start metanode
    let firstNode;
    // return nodes.find(node => getMetaName(node) === 'Start')
    firstNode = nodes.find(node => core.getAttribute(node, 'name') === 'Start');
    return firstNode;
  };

  // get a node's name
  function getName(node) {
    return core.getAttribute(node, 'name');
  }

  function getMetaName(node) {
    return getName(core.getMetaType(node));
  }


  // describe a node for logging purposes
  let describe = function(node, log=false) {
    let msg = core.getAttribute(node, 'name');
    msg += ' ' + core.getAttribute(node, 'direction');
    if (log) console.log(msg);
    return msg;
  }
  // Node.prototype.toString = function() {
  //   return core.getAttribute(this, 'name');
  // }


  // turn node into a simple form
  let stripNode = function(node) {
    let metadata = {
      name: getName(node),
      direction: core.getAttribute(node, 'direction'),
      distance: core.getAttribute(node, 'distance'),
      type: getName(core.getBaseType(node))
    };
    return metadata;
  }


  // check if a nodes is a stop node
  let isStopNode = function(node) {
    // TODO check using baseType
    return core.getAttribute(node, 'name') === 'Stop';
  };

  let cmdChain = [];
  // loads the chain of commands in order from srcNode
  let loadChain = function(srcNode, cb) {
    if (!srcNode) throw new Error('trying to load undefined node');

    if (isStopNode(srcNode)) {
      console.log('loaded all blocks.');
      cmdChain.forEach(cmd => describe(cmd, true));
      cmdChain = cmdChain.map(stripNode);
      console.log(cmdChain);
      // call the callback
      if (cb) cb(cmdChain);
      return cmdChain;
    }

    // generalize to check if is a command node
    if (core.isConnection(srcNode)) {
      core.loadPointer(srcNode, 'dst', function (err, destNode) {
        if (err) {
          console.log(err);
          // Handle error
        }
        // load the destination
        loadChain(destNode);
      });
    } else {
      // add it to command chain
      cmdChain.push(srcNode);
      // Load the nodes with pointers named 'src' to the sourceNode.
      // (Here the connections that have sourceNode as source.)
      core.loadCollection(srcNode, 'src', function (err, connNodes) {
        if (err) {
          console.error(err);
          // Handle error
        } else {
          if (connNodes.length > 1) throw new Error('more than one connection found.');
          // load the next one
          loadChain(connNodes[0]);
        }
      });
    }

  };
  
  core.loadSubTree(activeNode, function (err, nodes) {
    let connections = nodes.filter( node => core.isConnection(node));
    nodes = nodes.filter( node => !core.isConnection(node));

    // find start and follow the chain
    let robotAddress = getRobotAddress(nodes);
    setupSocket(robotAddress);
    let startNode = findStartNode(nodes);
    loadChain(startNode, sendCmds);
    
    if (err) {
      // Handle error
    }
    // Here we have access to all the nodes that is contained in node
    // at any level.
  });
  
  callback();
}
