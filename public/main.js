
// establish socket connection
let socket = io();


// vue goodness
let app = new Vue({
    el: '#app',
    data: {
        message: 'Hey you',
        commands: ''
    },
    computed: {
        // check command validity
        checkCommands() {
            let cmds;
            try {
                cmds = JSON.parse(this.commands);
                // check for easy errors
                let validCommands = ['left', 'right', 'stop'];
                let allValid = cmds.every(cmd => {
                    if (!isNaN(cmd) || validCommands.includes(cmd)) return true;
                });
                return allValid;
            } catch (e) {
                console.log(e);
                return false;
            }
        }
    },
    methods: {
        submit() {
            let cmds = JSON.parse(this.commands);
            socket.emit('submission', cmds);
        }
    }
});
