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

  // emits and object through the socket
  function sendCmds(cmds) {
      // socket should be setup globally
      if (!socket) handleError('Connection to robot is not ready.')
      socket.emit('submission', cmds);
      logger.info('sent commands', cmds);
  }

  // handle error and give user feedback
  function handleError(msg) {
    console.error(msg);
    logger.info(msg);
  }

  // returns the targeted robot address
  let getRobotAddress = function(nodes) {
    let node =  nodes.find(node => getMetaName(node) === 'ConnectionParameters')
    if (!node) handleError('Connection parameters are not set.');
    let host = core.getAttribute(node, 'robotAddress');
    let port = core.getAttribute(node, 'portNumber');
    if (!host || !port) handleError('Setup connection parameters to robot.');
    return 'http://'+host+':'+port;
  };

  // locate the startNode in a set of nodes
  let findStartNode = function(nodes) {
    // TODO add start metanode
    let firstNode;
    // return nodes.find(node => getMetaName(node) === 'Start')
    firstNode = nodes.find(node => core.getAttribute(node, 'name') === 'Start');
    if (!firstNode) handleError('Start node not found.')
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
  function describe(node, log=false) {
    let msg = core.getAttribute(node, 'name');
    msg += ' ' + core.getAttribute(node, 'direction');
    if (log) console.log(msg);
    return msg;
  }

  // turn node into a simple form
  function stripNode(node) {
    let metadata = {
      name: getName(node),
      direction: core.getAttribute(node, 'direction'),
      distance: core.getAttribute(node, 'distance'),
      type: getName(core.getBaseType(node))
    };
    if (metadata.distance && metadata.distance > 9) {
      handleError(metadata.name + ' Move distance is over the limit');
    }
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
      cmdChain.forEach(cmd => describe(cmd, true));
      cmdChain = cmdChain.map(stripNode);
      console.log('Command chain', cmdChain);
      // call the callback
      if (cb) cb(cmdChain);
      return cmdChain; // promisify? 
    }

    // generalize to check if is a command node
    if (core.isConnection(srcNode)) {
      core.loadPointer(srcNode, 'dst', function (err, destNode) {
        if (err) {
          handleError(err);
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
          handleError(err);
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
    if (nodes.length < 3) handleError('Add more commands.')

    // find start and follow the chain
    let robotAddress = getRobotAddress(nodes);
    setupSocket(robotAddress);
    let startNode = findStartNode(nodes);
    loadChain(startNode, sendCmds);
    
    if (err) {
      handleError(err);
    }
    // Here we have access to all the nodes that is contained in node
    // at any level.
  });
  
  callback();
}
