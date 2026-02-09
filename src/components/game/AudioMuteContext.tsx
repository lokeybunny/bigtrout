import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AudioMuteState {
  muteAll: boolean;
  muteSFX: boolean;
  toggleMuteAll: () => void;
  toggleMuteSFX: () => void;
}

const AudioMuteContext = createContext<AudioMuteState>({
  muteAll: false,
  muteSFX: false,
  toggleMuteAll: () => {},
  toggleMuteSFX: () => {},
});

export const useAudioMute = () => useContext(AudioMuteContext);

export const AudioMuteProvider = ({ children }: { children: ReactNode }) => {
  const [muteAll, setMuteAll] = useState(false);
  const [muteSFX, setMuteSFX] = useState(false);

  const toggleMuteAll = useCallback(() => setMuteAll(prev => !prev), []);
  const toggleMuteSFX = useCallback(() => setMuteSFX(prev => !prev), []);

  return (
    <AudioMuteContext.Provider value={{ muteAll, muteSFX, toggleMuteAll, toggleMuteSFX }}>
      {children}
    </AudioMuteContext.Provider>
  );
};
