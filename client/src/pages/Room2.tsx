import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { MdCall, MdCallEnd } from 'react-icons/md';
import { BsSend } from 'react-icons/bs';
import { FaVideo, FaVideoSlash } from 'react-icons/fa';
import { HiMiniSpeakerWave, HiMiniSpeakerXMark } from 'react-icons/hi2';
import { MessageSquare, X } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const socket = io('https://webrtc-backend-qckx.onrender.com', {
  transports: ['polling', 'websocket'],
  secure: true,
});

const Room2: React.FC = () => {
  const { roomId, name } = useParams<{ roomId: string; name: string }>();
  const { theme } = useTheme();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [showRemoteStream, setShowRemoteStream] = useState(false);
  const [remoteUserId, setRemoteUserId] = useState('');
  const [remoteUserName, setRemoteUserName] = useState('');
  const [remoteOffer, setRemoteOffer] = useState<RTCSessionDescriptionInit | null>(null);
  const [fromOffer, setFromOffer] = useState('');
  const [isInitiator, setIsInitiator] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ from: string; message: string }[]>([]);
  const [isRemoteVideoEnlarged, setIsRemoteVideoEnlarged] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteScreenShareRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (!showMobileChat && messages.length > 0) {
      setUnreadCount(prev => prev + 1);
    }
  }, [messages]);

  useEffect(() => {
    if (showMobileChat) setUnreadCount(0);
  }, [showMobileChat]);

  const createPeerConnection = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:global.stun.twilio.com:3478',
          ],
        },
      ],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { candidate: event.candidate, to: remoteUserId });
      }
    };

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    let isNegotiating = false;
    peer.onnegotiationneeded = async () => {
      if (isNegotiating) return;
      isNegotiating = true;
      try {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit('send-offer', {
          offer: peer.localDescription,
          to: remoteUserId,
          name: name,
        });
      } catch (err) {
        console.error('Negotiation error:', err);
      } finally {
        isNegotiating = false;
      }
    };

    peerConnectionRef.current = peer;
    return peer;
  };

  const handleLocalUserStreamAndCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (!stream) return;
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (error) {
      console.error('Error accessing media devices.', error);
    }
  };

  const handleJoinRoom = ({ name, userId }: { name: string; userId: string }) => {
    toast.success(`${name} is online`);
    setRemoteUserId(userId);
    setRemoteUserName(name);
  };

  const sendOffer = async () => {
    const offer = await peerConnectionRef.current?.createOffer();
    await peerConnectionRef.current?.setLocalDescription(offer);
    socket.emit('send-offer', {
      offer: peerConnectionRef.current?.localDescription,
      to: remoteUserId,
      name: name,
    });
  };

  const handleOfferReceived = async ({ offer, from, name }: { offer: RTCSessionDescriptionInit; from: string; name: string }) => {
    toast.success(`${name} is calling!`);
    setRemoteOffer(offer);
    setFromOffer(from);
    setIsInitiator(false);
    setRemoteUserName(name);
  };

  const answerCaller = async () => {
    setShowRemoteStream(true);
    if (peerConnectionRef.current && remoteOffer !== null) {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(remoteOffer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit('send-answer', { answer: peerConnectionRef.current.localDescription, to: fromOffer });
    }
  };

  const handleReceivedAnswer = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
    setShowRemoteStream(true);
    const peer = peerConnectionRef.current;
    await peer?.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const endCall = () => {
    setShowRemoteStream(false);
    if (localVideoRef.current?.srcObject) {
      const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    socket.emit('end-call', { name, remoteUserId, isStreamExist: localStream ? true : false });
  };

  const handleEndCallReciever = (name: string) => {
    toast.error(`${name} ended the call`);
    if (localVideoRef.current?.srcObject) {
      const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setShowRemoteStream(false);
  };

  const turnOnAndOffVideo = () => {
    if (localVideoRef.current) {
      const videoRef = localVideoRef.current.srcObject as MediaStream;
      const videoTrack = videoRef.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const turnOnAndOffAudio = () => {
    if (localVideoRef.current) {
      const videoRef = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = videoRef.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const handleScreenShareStartedRemote = ({ name }: { name: string }) => {
    const peer = peerConnectionRef.current;
    if (!peer) return;
    toast.success(`${name} started screen sharing`);
    peer.ontrack = (event) => {
      if (remoteScreenShareRef.current) remoteScreenShareRef.current.srcObject = event.streams[1];
    };
  };

  const handleMessageReceived = ({ message, from }: { message: string; from: string }) => {
    setMessages(prev => [...prev, { from, message }]);
  };

  useEffect(() => {
    socket.emit('join-room', { roomId, name });
    socket.on('user-joined', handleJoinRoom);
    socket.on('offer-received', handleOfferReceived);
    socket.on('answer-received', handleReceivedAnswer);
    socket.on('end-call-reciever', handleEndCallReciever);
    socket.on('screen-share-started-remote', handleScreenShareStartedRemote);
    socket.on('message-received', handleMessageReceived);
    socket.on('show-call-button', () => setIsInitiator(true));
    socket.on('show-answer-button', () => setIsInitiator(false));
    socket.on('ice-candidate', async ({ candidate }: any) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
    return () => {
      socket.off('user-joined', handleJoinRoom);
      socket.off('offer-received', handleOfferReceived);
      socket.off('answer-received', handleReceivedAnswer);
      socket.off('show-call-button');
      socket.off('show-answer-button');
      socket.off('end-call-reciever', handleEndCallReciever);
      socket.off('ice-candidate');
      socket.off('screen-share-started-remote', handleScreenShareStartedRemote);
      socket.off('message-received', handleMessageReceived);
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      peerConnectionRef.current?.close();
    };
  }, [roomId, name]);

  useEffect(() => {
    const pc = createPeerConnection();
    const startStream = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
    };
    startStream();
  }, []);

  useEffect(() => {
    localStream?.getTracks().forEach(track => peerConnectionRef.current?.addTrack(track, localStream));
  }, [localStream]);

  useEffect(() => {
    handleLocalUserStreamAndCall();
    createPeerConnection();
  }, []);

  const isDark = theme === 'dark';

  /* ─── Control button ─── */
  const CtrlBtn = ({
    onClick,
    active = true,
    danger = false,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    danger?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className="w-11 h-11 flex items-center justify-center rounded-full text-white transition-all duration-200 hover:scale-110 active:scale-95"
      style={{
        background: danger
          ? 'linear-gradient(135deg, #ef4444, #dc2626)'
          : active
          ? 'linear-gradient(135deg, #f97316, #fb923c)'
          : 'rgba(255,255,255,0.15)',
        boxShadow: danger
          ? '0 4px 16px rgba(239,68,68,0.4)'
          : active
          ? '0 4px 16px rgba(249,115,22,0.35)'
          : 'none',
      }}
    >
      {children}
    </button>
  );

  return (
    <div
      className="flex h-screen overflow-hidden relative"
      style={{ backgroundColor: isDark ? '#0d0d10' : '#f1f5f9' }}
    >
      {/* ── Mobile Chat Toggle ── */}
      <button
        className="absolute top-4 right-4 z-50 md:hidden flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)', boxShadow: '0 4px 16px rgba(249,115,22,0.4)' }}
        onClick={() => setShowMobileChat(!showMobileChat)}
      >
        {showMobileChat ? (
          <><X size={15} /> Close</>
        ) : (
          <>
            <MessageSquare size={15} />
            Chat
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* ═══════════ VIDEO SECTION ═══════════ */}
      <div
        className={`flex-1 flex flex-col relative p-3 transition-all duration-300 ${
          showMobileChat ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Main video container */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden rounded-2xl" style={{ background: '#0a0a0d', boxShadow: 'var(--shadow-xl)' }}>
          {localStream && (
            <>
              {isRemoteVideoEnlarged ? (
                <>
                  {/* Remote video fullscreen */}
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    onClick={() => setIsRemoteVideoEnlarged(false)}
                    className="w-full h-full object-cover cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none" />

                  {/* Local PiP */}
                  <div
                    className="absolute bottom-20 right-4 w-32 h-24 md:w-40 md:h-32 rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-105"
                    style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.6)', border: '2px solid rgba(255,255,255,0.2)' }}
                    onClick={() => setIsRemoteVideoEnlarged(false)}
                  >
                    <video ref={localVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-1.5 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-white text-xs font-medium">
                      {name}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Local video fullscreen */}
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none" />

                  {/* Name tag */}
                  <div className="absolute bottom-20 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm font-medium border border-white/10">
                    {name} (You)
                  </div>

                  {/* Remote PiP */}
                  {showRemoteStream && (
                    <div
                      className="absolute bottom-20 right-4 w-32 h-24 md:w-40 md:h-32 rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-105"
                      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.6)', border: '2px solid rgba(249,115,22,0.5)' }}
                      onClick={() => setIsRemoteVideoEnlarged(true)}
                    >
                      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <div className="absolute bottom-1.5 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-white text-xs font-medium">
                        {remoteUserName}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ── Control Bar ── */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 control-bar flex items-center gap-3 z-50">
            {/* Call / Answer */}
            {!showRemoteStream ? (
              <>
                {isInitiator && !remoteOffer && (
                  <CtrlBtn onClick={sendOffer}><MdCall size={20} /></CtrlBtn>
                )}
                {!isInitiator && remoteOffer && (
                  <CtrlBtn onClick={answerCaller}><MdCall size={20} /></CtrlBtn>
                )}
              </>
            ) : (
              <CtrlBtn onClick={endCall} danger><MdCallEnd size={20} /></CtrlBtn>
            )}

            {/* Video toggle */}
            <CtrlBtn onClick={turnOnAndOffVideo} active={isVideoOn}>
              {isVideoOn ? <FaVideoSlash size={18} /> : <FaVideo size={18} />}
            </CtrlBtn>

            {/* Audio toggle */}
            <CtrlBtn onClick={turnOnAndOffAudio} active={isAudioOn}>
              {isAudioOn ? <HiMiniSpeakerXMark size={20} /> : <HiMiniSpeakerWave size={20} />}
            </CtrlBtn>

            {/* Theme toggle inside bar */}
            <ThemeToggle />
          </div>
        </div>

        {/* Remote user indicator */}
        {remoteUserName && (
          <div
            className="absolute top-4 left-4 flex items-center gap-2.5 px-4 py-2 rounded-full backdrop-blur-md border"
            style={{
              background: 'rgba(249,115,22,0.15)',
              borderColor: 'rgba(249,115,22,0.3)',
              color: '#fff',
            }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-sm font-semibold">{remoteUserName}</span>
          </div>
        )}
      </div>

      {/* ═══════════ CHAT SECTION ═══════════ */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm md:relative md:w-80 flex flex-col transition-transform duration-300 z-40`}
        style={{
          transform: showMobileChat || typeof window !== 'undefined' && window.innerWidth >= 768 ? 'translateX(0)' : 'translateX(100%)',
          background: isDark ? 'var(--bg-surface)' : '#ffffff',
          borderLeft: `1px solid var(--border)`,
        }}
      >
        {/* Chat Header */}
        <div
          className="px-5 py-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare size={18} style={{ color: 'var(--brand)' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Chat
            </h2>
          </div>
          <button
            className="md:hidden p-1.5 rounded-lg transition-colors hover:bg-red-50"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => setShowMobileChat(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 py-16">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--bg-muted)' }}
              >
                <MessageSquare size={24} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>No messages yet</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Start the conversation!</p>
              </div>
            </div>
          )}

          {messages.map((msg, i) =>
            msg.from === name ? (
              /* Sent */
              <div key={i} className="flex justify-end">
                <div
                  className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-br-sm text-sm font-medium text-white"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #fb923c)',
                    boxShadow: '0 2px 12px rgba(249,115,22,0.25)',
                  }}
                >
                  {msg.message}
                </div>
              </div>
            ) : (
              /* Received */
              <div key={i} className="flex justify-start">
                <div
                  className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm"
                  style={{
                    background: 'var(--bg-muted)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--brand)' }}>{msg.from}</p>
                  {msg.message}
                </div>
              </div>
            )
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={e => {
            e.preventDefault();
            if (message.trim()) {
              socket.emit('send-message', { message, room: roomId, from: name });
              setMessage('');
            }
          }}
          className="flex items-center gap-2 px-4 py-4 shrink-0"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <input
            type="text"
            placeholder="Type a message…"
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="input-base flex-1 text-sm py-2.5"
            style={{ borderRadius: '0.875rem' }}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-white transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:scale-100 shrink-0"
            style={{
              background: 'linear-gradient(135deg, #f97316, #fb923c)',
              boxShadow: message.trim() ? '0 4px 16px rgba(249,115,22,0.35)' : 'none',
            }}
          >
            <BsSend size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Room2;