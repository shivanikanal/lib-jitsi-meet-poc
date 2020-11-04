import { IJitsiTrack } from "./i-jitsi-track";

const logThis = (log, data) => {
    // console.log('POC : ', log, data);
}

const confOptions = {
    openBridgeChannel: true
}

export class IJitsiConference {
    constructor(JitsiMeetJS, JitsiConnection) {
        this.JitsiMeetJS = JitsiMeetJS;
        this.JitsiConnection = JitsiConnection;
        this.JitsiTrack = null;
        this.conference = null;
        this.isJoined = false;
        return this;
    }

    init() {
        const room = this.JitsiConnection.initJitsiConference('shivanikanal1', confOptions);
        // this.JitsiTrack = new IJitsiTrack(this.JitsiMeetJS, this.JitsiConnection, room);
        // this.initTracks();
        room.on(this.JitsiMeetJS.events.conference.TRACK_ADDED, this.onRemoteTrackAdd.bind(this));
        room.on(this.JitsiMeetJS.events.conference.TRACK_REMOVED, this.onRemoteTrackRemove.bind(this));
        room.on(
            this.JitsiMeetJS.events.conference.CONFERENCE_JOINED,
            this.onConferenceJoined.bind(this));
        room.on(this.JitsiMeetJS.events.conference.USER_JOINED, this.onUserJoined.bind(this));
        room.on(this.JitsiMeetJS.events.conference.USER_LEFT, this.onUserLeft.bind(this));
        room.on(this.JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, track => {
            logThis(`${track.getType()} - ${track.isMuted()}`);
        });
        room.on(
            this.JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED,
            (userID, displayName) => logThis(`${userID} - ${displayName}`));
        room.on(
            this.JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED,
            (userID, audioLevel) => logThis(`${userID} - ${audioLevel}`));
        room.on(
            this.JitsiMeetJS.events.conference.PHONE_NUMBER_CHANGED,
            () => logThis(`${room.getPhoneNumber()} - ${room.getPhonePin()}`));
        room.join()
        console.log({room});
        this.conference = room;


        this.JitsiTrack = new IJitsiTrack(this.JitsiMeetJS, this.JitsiConnection, room);
        this.initTracks();
        this.bindWindowUnloadHandlers();

        return room;
    }  

    onWindowUnload() {
        if(this.localTracks) {
            for (let i = 0; i < this.localTracks.length; i++) {
                this.localTracks[i].dispose();
            }
            this.conference.leave();
            this.JitsiConnection.disconnect();
        }
    }

    bindWindowUnloadHandlers() { 
        $(window).bind('beforeunload', this.onWindowUnload.bind(this));
        $(window).bind('unload', this.onWindowUnload.bind(this));
    }

    initTracks() {
        const localTracks = this.JitsiTrack.createLocalTrack();
    }

    onRemoteTrackAdd(track) {
        logThis('on remote track', { track });
        this.JitsiTrack.addRemoteTrack(track);
    }

    onRemoteTrackRemove(track) {
        logThis('on remote remove', { track });
        this.JitsiTrack.removeRemoteTrack(track);
    }

    onConferenceJoined(...args) {
        logThis('conference joined', { args });
        this.isJoined = true;
        // this.JitsiTrack.addTracksToRoom()
    }

    onUserJoined(id) {
        console.log('user join', { id });
        this.JitsiTrack.initUserTracks(id);
    }

    onUserLeft(id) {
        console.log('user left', { id });
        this.JitsiTrack.removeUserTracks(id);
    }
}