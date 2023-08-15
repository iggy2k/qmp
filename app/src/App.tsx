import React, { useEffect, useState, useRef } from 'react';
import ReactHowler from 'react-howler';
import {
  PauseIcon, PlayIcon, ForwardIcon, BackwardIcon,
  AdjustmentsVerticalIcon, SpeakerWaveIcon, ArrowPathRoundedSquareIcon,
  CogIcon, Bars3Icon, DocumentArrowDownIcon, DocumentArrowUpIcon
} from '@heroicons/react/24/solid'

function App() {
  console.log(window.ipcRenderer);
  const player = useRef(null as any);

  const [isSent, setSent] = useState(false);
  const [fromMain, setFromMain] = useState<string | null>(null);
  const [play, setPlay] = useState(false);
  const [onTop, setOnTop] = useState(false);
  const [currTime, setCurrTime] = useState(0);
  const SEEK_SECONDS = 5;
  const cover = 10;
  const [metadata, setMetadata] = useState(null as any);

  const openFile = () => {

    window.Main.send("toMain", "trigger");
    window.Main.receive("fromMain", (data: any) => {
      console.log(`Received ${data.length} ${data} from main process`);
      console.log("date: " + data)
      setMetadata(data);
    });
  };

  const sendToElectron = () => {
    if (window.Main) {
      window.Main.sendMessage("Message from react");
      setSent(true);
    }
  };

  const collapse = () => {
    if (window.Main) {
      window.Main.Resize();
    }
  };

  const alwaysOnTop = () => {
    if (window.Main) {
      setOnTop(!onTop);
      window.Main.AlwaysOnTop();
    }
  };

  const getSeek = () => {
    if (play) {
      return player.current.seek();
    }
  }

  const setSeek = (forward: boolean) => {
    if (play) {
      player.current.seek(getSeek() + (forward ? SEEK_SECONDS : -SEEK_SECONDS));
    }
  }

  const getDuration = () => {
    if (play) {
      return player.current.duration();
    }
  }

  function updateProgress() {
    if (play) {
      setCurrTime(Math.round(getSeek() / getDuration() * 100));
    }
  }

  useEffect(() => {
    if (isSent && window.Main)
      window.Main.on('message', (message: string) => {
        setFromMain(message);
      });
  }, [fromMain, isSent]);

  setInterval(() => {
    updateProgress();
  }, 500);

  return (
    <div className='bg-slate-400'>
      <div className='grid grid-flow-col auto-cols-max'>
        <img className='w-[64px] h-[64px]' src={metadata !== undefined && metadata !== null ? `data:${metadata};base64,${metadata.toString('base64')}` : ''} alt="" />
        <div className='ml-1 mt-1'>
          <p>Track Name</p>
          <div className='grid grid-flow-col auto-cols-max'>
            <p>Author</p>
            <p> - </p>
            <p>Album</p>
          </div>
        </div>
      </div>
      <div className='grid grid-flow-col auto-cols-max'>
        <Bars3Icon
          className="h-6 text-black"
          onClick={collapse}
        />
        <AdjustmentsVerticalIcon className="h-6 text-black" />
        <BackwardIcon className="h-6 text-black" />
        {
          play ? <PauseIcon className="h-6 text-black" onClick={() => setPlay(!play)} />
            : <PlayIcon className="h-6 text-black" onClick={() => setPlay(!play)} />
        }
        <ForwardIcon className="h-6 text-black" />
        <SpeakerWaveIcon className="h-6 text-black" />
        <input className='accent-slate-600 bg-inherit w-[100px]' type="range" min="1" max="100"></input>
        <ArrowPathRoundedSquareIcon className="h-6 text-black" />
        <CogIcon className="h-6 text-black" />
        {
          onTop ? <DocumentArrowDownIcon className="h-6 text-black" onClick={alwaysOnTop} />
            : <DocumentArrowUpIcon className="h-6 text-black" onClick={alwaysOnTop} />
        }
      </div>
      <h1 className="bg-green-300">Response: {fromMain}</h1>
      <div className='bg-blue-300'>
        <button
          onClick={sendToElectron}
        >
          Send
        </button>
        <div className="bg-sky-300">
          <button
            onClick={() => setSeek(true)}
          >
            Seek +5
          </button>
          <p>{'#'.repeat(currTime)}</p>
          <button
            onClick={() => setSeek(false)}
          >
            Seek -5
          </button>
        </div>
      </div>
      <div className="bg-yellow-300">
        <button
          onClick={openFile}
        >
          Load Image
        </button>
      </div>
      <ReactHowler
        src={"file:///Users/iggy/Music/Test/1.flac"}
        playing={play}
        html5={true}
        ref={player}
      />
    </div >
  );
}

export default App;
