const logThis = (log, data) => {
    // console.log('POC : ', log, data);
}

export class IJitsiTrack {
    constructor(JitsiMeetJS, JitsiConnection, JitsiConference) {
        this.JitsiMeetJS = JitsiMeetJS;
        this.JitsiConnection = JitsiConnection;
        this.JitsiConference = JitsiConference;
        this.remoteTracks = {};
        this.localTracks = [];
        return this;
    }

    createLocalTrack() {
        this.JitsiMeetJS.createLocalTracks({ 
            devices: [ 'audio', 'video' ],
            facingMode: 'user'
        })
        .then((tracks) => {
            this.localTracks = this.onLocalTracksInit(tracks);
            return this.localTracks;
        })
        .catch(error => {
            throw error;
        });
    }

    onLocalTracksInit(tracks) {
        this.localTracks = tracks;
        for (let i = 0; i < this.localTracks.length; i++) {
            this.localTracks[i].addEventListener(
                this.JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
                audioLevel => console.log(`Audio Level local: ${audioLevel}`));
            this.localTracks[i].addEventListener(
                this.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
                () => console.log('local track muted'));
            this.localTracks[i].addEventListener(
                this.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                () => console.log('local track stoped'));
            this.localTracks[i].addEventListener(
                this.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
                deviceId =>
                    console.log(
                        `track audio output device was changed to ${deviceId}`));
            if (this.localTracks[i].getType() === 'video') {
                this.createVideoTrackUI(`localVideo${i}`);
                // if($(`#localVideo${i}`).length < 1) {
                //     $('#jitsi-video-tracks').append(`<video autoplay='1' id='localVideo${i}' style='width:180px; height: 300px; object-fit:cover; margin: 10px'/>`);
                //     this.localTracks[i].attach($(`#localVideo${i}`)[0]);
                // }
                this.localTracks[i].attach($(`#localVideo${i}`)[0]);
            } else {
                if($(`#localAudio${i}`).length < 1) {
                    $('#jitsi-audio-tracks').append(
                        `<audio autoplay='1' muted='true' id='localAudio${i}' />`);
                    this.localTracks[i].attach($(`#localAudio${i}`)[0]);
                }
            }
            if (this.JitsiConference.isJoined) {
                this.JitsiConference.addTrack(this.localTracks[i]);
            }
        }
        return this.localTracks;
    }

    addRemoteTrack(track) {
        if (track.isLocal()) {
            return;
        }
        const participant = track.getParticipantId();
    
        if (!this.remoteTracks[participant]) {
            this.remoteTracks[participant] = [];
        }
        const idx = this.remoteTracks[participant].push(track);
         
        track.addEventListener(
            this.JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
            audioLevel => console.log(`Audio Level remote: ${audioLevel}`));
        track.addEventListener(
            this.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
            () => console.log('remote track muted'));
        track.addEventListener(
            this.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
            () => console.log('remote track stoped'));
        track.addEventListener(this.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
            deviceId =>
                console.log(
                    `track audio output device was changed to ${deviceId}`));
        const id = participant + track.getType() + idx;
        if (track.getType() === 'video') {
            this.createVideoTrackUI(`${participant}video${idx}`);
        } else {
            if($(`#${participant}audio${idx}`).length <= 0) {
                $('#jitsi-audio-tracks').append(
                    `<audio autoplay='1' id='${participant}audio${idx}' />`);
            }
        }
        track.attach($(`#${id}`)[0]);
    }

    createVideoTrackUI(DOMId) {
        if($(`#${DOMId}`).length <= 0) {
            $('#jitsi-video-tracks').append(
                `<div id="video-container-${DOMId}" class="video-container" style="display:inline-block; vertical-align:middle;">
                    <video autoplay='1' id='${DOMId}' style='width:200px; height: 140px; object-fit:cover; margin: 10px; transform:rotateY(180deg)'></video>
                    <button class="microphone-btn" id='${DOMId}-microphone'>Mute</button>
                    <button class="camera-btn" id='${DOMId}-camera'>Camera</button>
                </div>
                `
            );
        }
    }

    removeRemoteTrack(track) {
        if (track.isLocal()) {
            return;
        }

        const participant = track.getParticipantId();
        if(this.remoteTracks[participant]) {
            delete this.remoteTracks[participant];
        }

        const idx = track.getId();
        track.removeEventListener(this.JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED, () => {});
        track.removeEventListener(this.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED, () => {});
        track.removeEventListener(this.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED, () => {});
        track.removeEventListener(this.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED, () => {});
        if (track.getType() === 'video') {
            // $(`video[id^='${participant}video']`).remove();
            $(`div[id^='video-container-${participant}video']`).remove();
        } else {
            // $(`audio[id^='${participant}audio']`).remove();
            $(`audio[id^='${participant}audio']`).remove();
        }
        track.detach(track.containers[0]);
    }

    initUserTracks(userId) {
        this.remoteTracks[userId] = [];
    }

    removeUserTracks(userId) {
        console.log('user left');
        if (!this.remoteTracks[userId]) {
            return;
        }
        const tracks = this.remoteTracks[userId];

        for (let i = 0; i < tracks.length; i++) {
            tracks[i].detach($(`#${userId}${tracks[i].getType()}`));
        }
    }

    addTracksToRoom() {
        for (let i = 0; i < this.localTracks.length; i++) {
            this.JitsiConference.addTrack(this.localTracks[i]);
        }
    }
}