import React from 'react';
import { MdCall, MdCallEnd } from 'react-icons/md';
import { FaVideo, FaVideoSlash } from 'react-icons/fa';
import { HiMiniSpeakerWave, HiMiniSpeakerXMark } from 'react-icons/hi2';
import ThemeToggle from './ThemeToggle';

interface CallControlsProps {
  showRemoteStream: boolean;
  isInitiator: boolean;
  remoteOffer: any;
  isVideoOn: boolean;
  isAudioOn: boolean;
  onSendOffer: () => void;
  onAnswerCaller: () => void;
  onEndCall: () => void;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
}

const CallControls: React.FC<CallControlsProps> = ({
  showRemoteStream,
  isInitiator,
  remoteOffer,
  isVideoOn,
  isAudioOn,
  onSendOffer,
  onAnswerCaller,
  onEndCall,
  onToggleVideo,
  onToggleAudio,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fadeInUp">
      <div className="control-group">
        {!showRemoteStream ? (
          <>
            {isInitiator && !remoteOffer && (
              <button 
                onClick={onSendOffer} 
                className="control-btn control-btn-primary"
                title="Start Call"
              >
                <MdCall size={24} />
              </button>
            )}
            {!isInitiator && remoteOffer && (
              <button 
                onClick={onAnswerCaller} 
                className="control-btn control-btn-primary animate-bounce"
                title="Answer Call"
              >
                <MdCall size={24} />
              </button>
            )}
          </>
        ) : (
          <button 
            onClick={onEndCall} 
            className="control-btn control-btn-danger"
            title="End Call"
          >
            <MdCallEnd size={24} />
          </button>
        )}

        <button 
          onClick={onToggleVideo} 
          className={`control-btn ${isVideoOn ? 'control-btn-secondary' : 'bg-red-500/20 text-red-500 border border-red-500/50'}`}
          title={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
        >
          {isVideoOn ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
        </button>

        <button 
          onClick={onToggleAudio} 
          className={`control-btn ${isAudioOn ? 'control-btn-secondary' : 'bg-red-500/20 text-red-500 border border-red-500/50'}`}
          title={isAudioOn ? "Mute Microphone" : "Unmute Microphone"}
        >
          {isAudioOn ? <HiMiniSpeakerWave size={22} /> : <HiMiniSpeakerXMark size={22} />}
        </button>

        <div className="w-px h-8 bg-white/10 mx-2 hidden sm:block" />
        
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default CallControls;
