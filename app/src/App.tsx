import React, { useEffect, useState, useRef } from 'react';
import ReactHowler from 'react-howler';

import {
  PauseIcon, PlayIcon, ForwardIcon, BackwardIcon,
  AdjustmentsVerticalIcon, SpeakerWaveIcon, ArrowPathRoundedSquareIcon,
  CogIcon, Bars3Icon, DocumentArrowDownIcon, DocumentArrowUpIcon,
  HandRaisedIcon
} from '@heroicons/react/24/solid'

function App() {
  // console.log(window.ipcRenderer);
  const player = useRef(null as any);

  const [isSent, setSent] = useState(false);
  const [fromMain, setFromMain] = useState<string | null>(null);
  const [play, setPlay] = useState(false);
  const [onTop, setOnTop] = useState(false);
  const [currTime, setCurrTime] = useState(0);
  const SEEK_SECONDS = 5;
  const [cover, setCover] = useState(null as any);

  const [title, setTitle] = useState("Title");
  const [artist, setArtist] = useState("Artist");
  const [album, setAlbum] = useState("Album");

  const [repeat, setRepeat] = useState(false);

  const [files, setFiles] = useState([]);

  const openFile = () => {

    window.Main.send("toMain", "/Users/iggy/Music/Test/Dorisburg - Cirkla.flac");
    window.Main.receive("fromMain", (data: any) => {
      //console.log(`Received ${data.length} ${data} from main process`);
      //console.log("date: " + data)
      setCover(data[1]);
      setTitle(data[0].common['title']);
      setArtist(data[0].common['artist']);
      setAlbum(data[0].common['album']);
    });
    openDir();
  };

  const openDir = () => {

    window.Main.send("get-files-to-main", "trigger");
    window.Main.receive("get-files-from-main", (data: any) => {
      setFiles(data);
      console.log(data);
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


  function relativeCoords(e: any) {
    var bounds = e.target.getBoundingClientRect();
    var x = e.clientX - bounds.left;
    // var y = e.clientY - bounds.top;
    player.current.seek(player.current.duration() / 150 * x);
  }

  useEffect(() => {
    openFile();
  }, []);

  useEffect(() => {
    if (isSent && window.Main)
      window.Main.on('message', (message: string) => {
        setFromMain(message);
      });
  }, [fromMain, isSent]);

  setInterval(() => {
    updateProgress();
  }, 100);

  return (
    <div className='bg-[#333333]'>
      <div className='sticky top-0 bg-[#333333] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] '>
        <div className='grid grid-flow-col auto-cols-max '>
          <img className='w-[64px] h-[64px] rounded-lg m-2' src={cover !== undefined && cover !== null ? `data:${cover};base64,${cover.toString('base64')}` : ''} alt="" />
          <div className='ml-1 mt-2'>
            <p className='text-[#a1918c]'>{title}</p>
            <div className='text-[#6e635f] grid grid-flow-col auto-cols-max'>
              <p>{artist}</p>
              <p>&nbsp;-&nbsp;</p>
              <p>{album}</p>
            </div>
            <div
              onClick={(e) => { relativeCoords(e) }}
            >
              <svg width="150" height="20" viewBox="0 0 800 80"
                className='clip1 absolute'
                style={{ clipPath: `inset(0 ${100 - currTime}% 0 0)` }}
              >
                {play ?

                  <defs>
                    <path stroke="#c1b7b4" fill="none" id="sign-wave" d="
             M0 50
             C 40 10, 60 10, 100 50 C 140 90, 160 90, 200 50
             C 240 10, 260 10, 300 50 C 340 90, 360 90, 400 50
             C 440 10, 460 10, 500 50 C 540 90, 560 90, 600 50
             C 640 10, 660 10, 700 50 C 740 90, 760 90, 800 50
             C 840 10, 860 10, 900 50 C 940 90, 960 90, 1000 50
             C 1040 10, 1060 10, 1100 50 C 1140 90, 1160 90, 1200 50
             " stroke-width="12" />
                  </defs>
                  :
                  <defs>
                    <path stroke="#c1b7b4" fill="none" id="sign-wave" d="
             M0 50
             L 1200 50
             " stroke-width="12" />
                  </defs>
                }
                <use href="#sign-wave" x="0" y="0">
                  <animate attributeName="x" from="0" to="-200" dur="6s" repeatCount="indefinite" />
                </use>
              </svg>
              <svg width="150" height="20" viewBox="0 0 800 80"
                className='clip1 absolute'
                style={{ clipPath: `inset(0 0 0 ${currTime}%)` }}
              >
                <defs>
                  <path stroke="#c1b7b4" fill="none" id="sign-wave2" d="
             M0 50
             L 1200 50
             " stroke-width="12" />
                </defs>
                <use href="#sign-wave2" x="0" y="0">
                  <animate attributeName="x" from="0" to="-200" dur="6s" repeatCount="indefinite" />
                </use>
              </svg>
              <svg width="150" height="20" className='clip1 absolute' viewBox="0 0 800 80">
                <ellipse cx={currTime * 8} cy="50" rx="20" ry="40" fill="#c1b7b4"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className='grid grid-flow-col auto-cols-max m-2'>
          <Bars3Icon
            className="h-6 text-[#a1918c] m-1"
            onClick={collapse}
          />
          <AdjustmentsVerticalIcon className="h-6 text-[#a1918c] m-1" />
          <BackwardIcon className="h-6 text-[#a1918c] m-1" />
          {
            play ? <PauseIcon className="h-6 text-[#a1918c] m-1" onClick={() => setPlay(!play)} />
              : <PlayIcon className="h-6 text-[#a1918c] m-1" onClick={() => setPlay(!play)} />
          }
          <ForwardIcon className="h-6 text-[#a1918c] m-1" />
          <SpeakerWaveIcon className="h-6 text-[#a1918c] m-1" />
          <input className='accent-[#a1918c] bg-inherit w-[100px]' type="range" min="1" max="100"></input>
          <ArrowPathRoundedSquareIcon
            className={repeat ? "h-6 text-[#a1918c] m-1" : "h-6 text-[#f08665] m-1"}
            onMouseDown={() => { setRepeat(!repeat) }} />
          <CogIcon className="h-6 text-[#a1918c] m-1" />
          {
            onTop ? <DocumentArrowDownIcon className="h-6 text-[#f08665] m-1" onClick={alwaysOnTop} />
              : <DocumentArrowUpIcon className="h-6 text-[#a1918c] m-1" onClick={alwaysOnTop} />
          }
          <HandRaisedIcon className="h-6 text-[#a1918c] m-1 drag" />
        </div>
      </div>
      <div className='overflow-hidden'>
        {files.map(function (file: string, index: number) {
          return (
            <div className='overflow-auto hover:bg-black/20'>
              <div className={index == 1 ? 'border-b border-[#f08665] grid grid-flow-col auto-cols-max'
                : 'border-b border-t border-[#f08665] grid grid-flow-col auto-cols-max'}>
                <img className='w-[32px] h-[32px] rounded-lg m-2' src={cover !== undefined && cover !== null ? `data:${cover};base64,${cover.toString('base64')}` : ''} alt="" />
                <p className='text-[#a1918c] mt-3'>{file.split('/').reverse()[0]}</p>
              </div>
            </div>
          )
        })}
      </div>
      <ReactHowler
        src={"file:///Users/iggy/Music/Test/1.flac"}
        playing={play}
        html5={true}
        ref={player}
      />
      <div className='bg-transparent'></div>
    </div >
  );
}

export default App;
