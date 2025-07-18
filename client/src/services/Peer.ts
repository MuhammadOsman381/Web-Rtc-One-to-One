class PeerService {
    private peer: RTCPeerConnection;

    constructor() {
        this.peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478",
                    ],
                },
            ],
        });
    }

    async sendAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit | undefined> {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peer.createAnswer();
            await this.peer.setLocalDescription(answer);
            return answer;
        }
    }

    async setLocalDescription(answer: RTCSessionDescriptionInit): Promise<void> {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }

    async sendOffer(): Promise<RTCSessionDescriptionInit | undefined> {
        if (this.peer) {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(offer);
            return offer;
        }
    }
}


export default new PeerService();