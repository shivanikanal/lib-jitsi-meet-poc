console.log('here!!');
import { IJitsiConference } from "./i-jitsi-conference";
import { IJitsiTrack } from "./i-jitsi-track";

let JitsiMeet;
let JitsiConnection;
const connectionOptions = {
    hosts: {
        domain: 'jitsi.insider.in',
        muc: 'conference.jitsi.insider.in' // FIXME: use XEP-0030
    },
    bosh: 'https://jitsi.insider.in/http-bind?room=shivanikanal1',
    serviceUrl: 'https://jitsi.insider.in/http-bind?room=shivanikanal1',
    // The name of client node advertised in XEP-0115 'c' stanza
    clientNode: 'http://jitsi.org/jitsimeet',
    openBridgeChannel: true,
    enableWelcomePage: true,
    id: 'shivani',
    password: 'shivani'
}

const onConnectionSuccess = () => {
    console.log('Jitsi Connection Success');
    $('#jitsi-room').show();
    const jitsiConf = new IJitsiConference(JitsiMeetJS, JitsiConnection);
    const room = jitsiConf.init();
    // const jitsiTrack = new IJitsiTrack(JitsiMeetJS, JitsiConnection, room);
    // const localTracks = jitsiTrack.createLocalTrack();
    window.myConf = room;
    window.myJitsiMeetJS = JitsiMeetJS;
    window.myJitsiConnection = JitsiConnection;
}

const onConnectionFailed = () => {
    console.log('Jitsi connection failed');
}

const disconnect = () => {
    console.log('Jitsi disconnected');
}

const initJitsiComponent = () => {
    try {
        if(JitsiMeetJS) {
            JitsiMeet = JitsiMeetJS.init();
            JitsiConnection = new JitsiMeetJS.JitsiConnection(null, null, connectionOptions);
            JitsiConnection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess);
            JitsiConnection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed);
            JitsiConnection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnect);
            JitsiConnection.connect();
        } else {
            console.log('Error loading jitsi lib');
        }
    } catch(error) {
        console.error(error);
    }
}

initJitsiComponent();