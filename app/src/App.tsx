import React, { useEffect, useState, useRef } from 'react'
import ReactHowler from 'react-howler'

import {
    PauseIcon,
    PlayIcon,
    ForwardIcon,
    BackwardIcon,
    AdjustmentsVerticalIcon,
    SpeakerWaveIcon,
    ArrowPathRoundedSquareIcon,
    CogIcon,
    Bars3Icon,
    DocumentArrowDownIcon,
    DocumentArrowUpIcon,
    HandRaisedIcon,
    ChevronDoubleUpIcon,
    FolderPlusIcon,
} from '@heroicons/react/24/solid'

function App() {
    const audioRef = useRef(null as any)
    const AudioContext = window.AudioContext
    const audioContext = new AudioContext()
    const gain = audioContext.createGain()

    const [volume, setVolume] = useState(0.5)

    useEffect(() => {
        if (audioRef != null) {
            const track = audioContext.createMediaElementSource(
                audioRef.current
            )
            track.connect(audioContext.destination)
            gain.connect(audioContext.destination)
        }
    }, [audioRef])

    useEffect(() => {
        // gain.disconnect(audioContext.destination)
        gain.gain.value = volume
        console.log('volume = ', volume)
        // gain.connect(audioContext.destination)
    }, [volume])

    const onLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration)
            console.log('duration = ' + duration)
        }
    }

    const [isSent, setSent] = useState(false)
    const [fromMain, setFromMain] = useState<string | null>(null)
    const [play, setPlay] = useState(false)
    const [onTop, setOnTop] = useState(false)
    const [currTime, setCurrTime] = useState(0)

    const [cover, setCover] = useState(null as any)

    const [title, setTitle] = useState('Title')
    const [artist, setArtist] = useState('Artist')
    const [album, setAlbum] = useState('Album')

    const [repeat, setRepeat] = useState(false)

    const [files, setFiles] = useState([])

    const [currFile, setCurrFile] = useState('')

    const [currIdx, setCurrIdx] = useState(0)

    const [resized, setResized] = useState(false)

    const [progress, setProgress] = useState(0)

    const [duration, setDuration] = useState(0)

    const [currDir, setCurrDir] = useState('')

    const [covers, setCovers] = useState<any[]>([])

    const [mouseDown, setMouseDown] = useState(false)

    const openSettings = () => {
        window.Main.send('open-settings-tm', null)
    }

    useEffect(() => {
        console.log('progress = ', progress)
    }, [progress])

    const togglePlay = () => {
        // if (audioContext.state === 'suspended') {
        //     audioContext.resume()
        // }
        if (!play) {
            setPlay(true)
            audioRef.current.play()
        } else {
            setPlay(false)
            audioRef.current.pause()
        }
    }

    const openFile = (path: string, index: number) => {
        if (index < 0) {
            index = files.length - 1
        } else if (index > files.length - 1) {
            index = 0
        }

        console.log(`Loaded: path ${path}, idx ${index}`)

        setCurrIdx(index)
        setCurrFile(path)

        window.Main.send('toMain', [path])
        window.Main.receive('fromMain', (data: any) => {
            //console.log(`Received ${data.length} ${data} from main process`);
            //console.log("date: " + data)
            setCover(data[1][0])
            setTitle(data[0][0].common['title'])
            setArtist(data[0][0].common['artist'])
            setAlbum(data[0][0].common['album'])
        })
    }

    const openDir = (openDefault: boolean) => {
        var covrs: any[] = []
        window.Main.send('open-folder-tm', openDefault)
        window.Main.receive('open-folder-fm', (path: string | undefined) => {
            if (path !== undefined) {
                setCurrDir(path)
                window.Main.send('get-files-to-main', path)
                window.Main.receive('get-files-from-main', (data: any) => {
                    setFiles(data)
                    console.log(data)
                    const paths = Object.values(data)
                    window.Main.send('toMain', paths)
                    window.Main.receive('fromMain', (data2: any) => {
                        if (data2[1].length > 1) {
                            console.log('Setting covers!!!')
                            setCovers(data2[1])
                        }
                    })
                })
            }
        })
    }

    const collapse = () => {
        if (window.Main) {
            window.Main.Resize()
            setResized(!resized)
        }
    }

    const alwaysOnTop = () => {
        if (window.Main) {
            setOnTop(!onTop)
            window.Main.AlwaysOnTop()
        }
    }

    const setSeek = (time: number) => {
        audioRef.current.currentTime = time
        // audioRef.current.play()
    }

    const updateProgress = () => {
        let frac = audioRef.current.currentTime / duration
        setCurrTime(Math.round(frac * 100))
        setProgress(Math.round(frac * 800))
        // console.log('audioContext.currentTime  = ' + audioContext.currentTime)
        // console.log('duration = ' + duration)
    }

    const relativeCoords = (e: any) => {
        e.stopPropagation()
        let elem = document.getElementById('track')
        var bounds = elem!.getBoundingClientRect()
        var x = e.clientX - bounds.left
        var relative_pos = (duration / 150) * x
        if (mouseDown) {
            setSeek(relative_pos)
        }
        // console.log("bounds.left " + bounds.left)
        // console.log("e.clientX " + e.clientX)
    }

    useEffect(() => {
        openDir(true)
    }, [])

    useEffect(() => {
        console.log('Covers len: ' + covers.length)
    }, [covers])

    useEffect(() => {
        console.log('files.length: ' + files.length)
        if (files.length > 0) {
            openFile(files[0], 0)
        }
    }, [files])

    useEffect(() => {
        if (isSent && window.Main)
            window.Main.on('message', (message: string) => {
                setFromMain(message)
            })
    }, [fromMain, isSent])

    setInterval(() => {
        if (!mouseDown) {
            updateProgress()
        }
    }, 100)

    return (
        <div className="bg-[#333333]">
            <div className="grid grid-flow-col auto-cols-max pt-3 px-3 gap-3 opacity-0 hover:opacity-100 transition-opacity	fixed min-w-full min-h-[20px] shadow-[inset_2px_25px_25px_-26px_#000000]">
                <div
                    className="min-h-[12px] min-w-[12px] bg-red-500 hover:bg-[#b52424] rounded-full"
                    onClick={() => {
                        window.Main.Close()
                    }}
                ></div>
                <div
                    className="min-h-[12px] min-w-[12px] bg-yellow-500 hover:bg-[#939624] rounded-full"
                    onClick={() => {
                        window.Main.Minimize()
                    }}
                ></div>
                {/* <div className="min-h-[12px] min-w-[12px] bg-green-500 hover:bg-[#2d9624] rounded-full"></div> */}
            </div>
            <div className="bg-[#333333]">
                <div className="grid grid-flow-col auto-cols-max ">
                    <img
                        className="w-[64px] h-[64px] rounded-lg m-3 mb-0"
                        src={
                            cover !== undefined && cover !== null
                                ? `data:${cover};base64,${cover.toString(
                                      'base64'
                                  )}`
                                : ''
                        }
                        alt=""
                    />
                    <div className="ml-1 mt-2">
                        <p className="text-[#a1918c]">{title}</p>
                        <div className="text-[#6e635f] grid grid-flow-col auto-cols-max">
                            <p>{artist}</p>
                            <p>&nbsp;-&nbsp;</p>
                            <p>{album}</p>
                        </div>
                        <div
                            id="track"
                            // This id value needed as using e.target can target the child
                            // latter being the track knob which has its own bounds.
                            // This causes unexpected bahaviour
                            onMouseMove={(e) => {
                                relativeCoords(e)
                            }}
                            onMouseDown={() => setMouseDown(true)}
                            onMouseUp={() => setMouseDown(false)}
                        >
                            <svg
                                width="150"
                                height="20"
                                viewBox="0 0 800 80"
                                className="clip1 absolute"
                                style={{
                                    clipPath: `inset(0 ${100 - currTime}% 0 0)`,
                                }}
                            >
                                {play ? (
                                    <defs>
                                        <path
                                            stroke="#c1b7b4"
                                            fill="none"
                                            id="sign-wave"
                                            d="
             M0 50
             C 40 10, 60 10, 100 50 C 140 90, 160 90, 200 50
             C 240 10, 260 10, 300 50 C 340 90, 360 90, 400 50
             C 440 10, 460 10, 500 50 C 540 90, 560 90, 600 50
             C 640 10, 660 10, 700 50 C 740 90, 760 90, 800 50
             C 840 10, 860 10, 900 50 C 940 90, 960 90, 1000 50
             C 1040 10, 1060 10, 1100 50 C 1140 90, 1160 90, 1200 50
             "
                                            stroke-width="12"
                                        />
                                    </defs>
                                ) : (
                                    <defs>
                                        <path
                                            stroke="#c1b7b4"
                                            fill="none"
                                            id="sign-wave"
                                            d="
             M0 50
             L 1200 50
             "
                                            stroke-width="12"
                                        />
                                    </defs>
                                )}
                                <use href="#sign-wave" x="0" y="0">
                                    <animate
                                        attributeName="x"
                                        from="0"
                                        to="-200"
                                        dur="6s"
                                        repeatCount="indefinite"
                                    />
                                </use>
                            </svg>
                            <svg
                                width="150"
                                height="20"
                                viewBox="0 0 800 80"
                                className="clip1 absolute"
                                style={{
                                    clipPath: `inset(0 0 0 ${currTime}%)`,
                                }}
                            >
                                <defs>
                                    <path
                                        stroke="#c1b7b4"
                                        opacity={0.5}
                                        fill="none"
                                        id="sign-wave2"
                                        d="
             M0 50
             L 1200 50
             "
                                        stroke-width="12"
                                    />
                                </defs>
                                <use href="#sign-wave2" x="0" y="0">
                                    <animate
                                        attributeName="x"
                                        from="0"
                                        to="-200"
                                        dur="6s"
                                        repeatCount="indefinite"
                                    />
                                </use>
                            </svg>
                            <svg
                                width="150"
                                height="20"
                                className="clip1 absolute"
                                viewBox="0 0 800 80"
                            >
                                <ellipse
                                    cx={progress}
                                    cy="50"
                                    rx="20"
                                    ry="40"
                                    fill={mouseDown ? '#f08665' : '#c1b7b4'}
                                />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="grid grid-flow-col auto-cols-max m-2 mt-0">
                    {resized ? (
                        <Bars3Icon
                            className="h-6 text-[#a1918c] m-1"
                            onClick={collapse}
                        />
                    ) : (
                        <ChevronDoubleUpIcon
                            className="h-6 text-[#a1918c] m-1"
                            onClick={collapse}
                        />
                    )}

                    <AdjustmentsVerticalIcon className="h-6 text-[#a1918c] m-1" />
                    <BackwardIcon
                        className="h-6 text-[#a1918c] m-1"
                        onClick={() => {
                            openFile(files[currIdx - 1], currIdx - 1)
                        }}
                    />
                    {play ? (
                        <PauseIcon
                            className="h-6 text-[#a1918c] m-1"
                            onClick={() => togglePlay()}
                        />
                    ) : (
                        <PlayIcon
                            className="h-6 text-[#a1918c] m-1"
                            onClick={() => togglePlay()}
                        />
                    )}
                    <ForwardIcon
                        className="h-6 text-[#a1918c] m-1"
                        onClick={() => {
                            openFile(files[currIdx + 1], currIdx + 1)
                        }}
                    />
                    <SpeakerWaveIcon className="h-6 text-[#a1918c] m-1" />
                    <input
                        className="accent-[#a1918c] bg-inherit w-[100px]"
                        type="range"
                        min="0"
                        max="100"
                        onChange={(e) =>
                            setVolume(parseFloat(e.target.value) / 100)
                        }
                    ></input>
                    <ArrowPathRoundedSquareIcon
                        className={
                            repeat
                                ? 'h-6 text-[#a1918c] m-1'
                                : 'h-6 text-[#f08665] m-1'
                        }
                        onMouseDown={() => {
                            setRepeat(!repeat)
                        }}
                    />
                    <CogIcon
                        className="h-6 text-[#a1918c] m-1"
                        onClick={() => {
                            openSettings()
                        }}
                    />
                    {onTop ? (
                        <DocumentArrowDownIcon
                            className="h-6 text-[#f08665] m-1"
                            onClick={alwaysOnTop}
                        />
                    ) : (
                        <DocumentArrowUpIcon
                            className="h-6 text-[#a1918c] m-1"
                            onClick={alwaysOnTop}
                        />
                    )}
                    <HandRaisedIcon className="h-6 text-[#a1918c] m-1 drag" />
                    <FolderPlusIcon
                        className="h-6 text-[#a1918c] m-1"
                        onClick={() => {
                            openDir(false)
                        }}
                    />
                </div>
            </div>

            <div className="overflow-y-auto max-h-[315px]">
                {covers.length > 0 &&
                    files.map((file: string, index: number) => {
                        return (
                            <div
                                key={index}
                                className={`overflow-auto hover:bg-black/20 ${
                                    index == currIdx ? 'bg-[#f08665]/20' : ''
                                }`}
                            >
                                <div
                                    className={
                                        index == 1
                                            ? 'border-b border-[#f08665] grid grid-flow-col auto-cols-max'
                                            : 'border-b border-t border-[#f08665] grid grid-flow-col auto-cols-max'
                                    }
                                    onClick={() => {
                                        openFile(file, index)
                                    }}
                                >
                                    <img
                                        className="w-[32px] h-[32px] rounded-lg m-2"
                                        src={
                                            covers[index] !== undefined &&
                                            covers[index] !== null
                                                ? `data:${
                                                      covers[index]
                                                  };base64,${covers[
                                                      index
                                                  ].toString('base64')}`
                                                : ''
                                        }
                                        alt=""
                                    />
                                    <p className="text-[#a1918c] mt-3">
                                        {file
                                            .split('/')
                                            .reverse()[0]
                                            .replace(/\.[^/.]+$/, '')}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
            </div>
            {/* <ReactHowler
                src={`file://${currFile}`}
                playing={play}
                html5={true}
                ref={player}
                volume={volume}
            /> */}
            <audio
                onLoadedMetadata={onLoadedMetadata}
                ref={audioRef}
                src={`file://${currFile}`}
                // onPlay={handleAudioPlay}
            ></audio>
            <div className="bg-transparent"></div>
        </div>
    )
}

export default App
