# Team Robots
Team members: Tim Darrah, Nicole Hutchins, Hamid Zare

## Installation
To run the WebGME server with robotics capabilities, run `npm i && webgme start` in the `./webgme` directory. You should have the webgme cli gloablly installed through npm. (`npm i -g webgme-cli`)

### Socket.io server
- Intall the following packages for python server `flask flask-socketio eventlet`
- To use the node server run `npm install && npm start`

## Project Structure
 - `src/server.js`: contains simple websocket server implementations for node
 - `public`: simple vue.js powered interface to interactively test the robots
 - `webgme`: our installation of webgme containing the plugin and decorator
 
 More details about the robot-side implementations can be found at the [TeachableRobots repo](https://github.com/darrahts/TeachableRobots/tree/master/WorkingCurrent)
