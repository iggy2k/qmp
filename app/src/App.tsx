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

const AudioContext = window.AudioContext
var audioContext: any = null
let duration = 0
let track: any = null
let gain: any = null
const audio = new Audio()

function App() {
    const [volume, setVolume] = useState(0.5)

    const downloadCover = (b64data: any) => {
        if (b64data !== undefined) {
            // console.log('downloading cover ' + b64data)
            window.Main.SaveCover(b64data.toString('base64'))
        }
    }

    // useEffect(() => {
    //     audioContext = new AudioContext()
    //     track = audioContext.createMediaElementSource(audio)
    //     gain = audioContext.createGain()
    //     track.connect(gain).connect(audioContext.destination)
    // }, [])

    // useEffect(() => {
    //     // gain.disconnect(audioContext.destination)
    //     if (gain) {
    //         gain.gain.value = volume
    //         gain.gain.setValueAtTime(volume, audioContext.currentTime + 1)
    //         console.log('volume = ', volume)
    //     }
    // }, [volume])

    const onLoadedMetadata = () => {
        if (audio) {
            duration = audio.duration
        }
    }

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

    const [currDir, setCurrDir] = useState('')

    const [covers, setCovers] = useState<any[]>([])

    const [formats, setFormats] = useState<any[]>([])

    const [sampleRates, setSampleRates] = useState<any[]>([])

    const [mouseDown, setMouseDown] = useState(false)

    const updateProgress = () => {
        if (audio) {
            let frac = audio.currentTime / duration
            if (frac !== Infinity) {
                let new_progress = Math.trunc(frac * 800)
                let new_time = Math.trunc(frac * 100)
                // console.log('currTime = ' + audio.currentTime)
                // console.log('duration = ' + duration)
                // console.log('frac = ' + frac)
                if (new_progress !== Infinity && !Number.isNaN(new_progress)) {
                    // console.log('new_progress = ' + new_progress)
                    setProgress(new_progress)
                    setCurrTime(new_time)
                }
                if (frac == 1 && play) {
                    togglePlay()
                }
            }
        }
    }

    audio.onloadedmetadata = onLoadedMetadata
    audio.ontimeupdate = updateProgress

    const openSettings = () => {
        window.Main.send('open-settings-tm', null)
    }

    useEffect(() => {
        audio.src = currFile ? `file://${currFile}` : ''
    }, [currFile])

    useEffect(() => {
        audio.loop = repeat
        audio.volume = volume
    }, [repeat, volume])

    useEffect(() => {
        console.log(`play = ${play}`)
    }, [play])

    const togglePlay = () => {
        console.log(`Toggle play -> paused=${audio.paused}`)
        // if (audioContext.state === 'suspended') {
        //     audioContext.resume()
        // }
        if (audio) {
            if (audio.paused) {
                audio.play()
                setPlay(true)
            } else {
                audio.pause()
                setPlay(false)
            }
        } else {
            console.log(`audio=${audio}`)
        }
    }

    const openFile = (index: number) => {
        if (index < 0) {
            index = files.length - 1
        } else if (index > files.length - 1) {
            index = 0
        }

        console.log(`Loaded: path ${files[index]}, idx ${index}`)

        setCurrIdx(index)
        setCurrFile(files[index])

        window.Main.send('toMain', [files[index]])
        window.Main.receive('fromMain', (data: any) => {
            //console.log(`Received ${data.length} ${data} from main process`);
            //console.log("date: " + data)
            setCover(data[1][0])
            console.log(data[0][0])
            setTitle(data[0][0].common['title'])
            setArtist(data[0][0].common['artist'])
            setAlbum(data[0][0].common['album'])
            if (audio && !Number.isNaN(audio.duration)) {
                duration = audio.duration
                // console.log('duration = ' + duration)
            }
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
                    if (data.length > 0) {
                        setFiles(data)
                        const paths = Object.values(data)
                        window.Main.send('toMain', paths)
                        window.Main.receive('fromMain', (data2: any) => {
                            if (data2[1].length > 1) {
                                console.log('Setting covers')
                                setCovers(data2[1])
                                setFormats(
                                    data2[0].map(
                                        (trackData: {
                                            [x: string]: { [x: string]: any }
                                        }) => trackData['format']['container']
                                    )
                                )
                                setSampleRates(
                                    data2[0].map(
                                        (trackData: {
                                            [x: string]: { [x: string]: any }
                                        }) => trackData['format']['sampleRate']
                                    )
                                )
                            }
                        })
                    }
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
        if (audio) {
            audio.currentTime = time
        }
        // audio.play()
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
        console.log('audio.paused = ' + audio.paused)
        if (currDir === '') {
            // Prevent hot-reaload infinite-loop
            openDir(true)
        }
        if (audio) {
            audio.pause()
            setPlay(false)
        }
        return () => {
            audio.pause()
            console.log('in cleanup')
        }
    }, [])

    useEffect(() => {
        if (files.length > currIdx) {
            openFile(currIdx)
        }
    }, [files])

    useEffect(() => {
        if (progress === 800 && !repeat) {
            openFile(currIdx + 1)
        }
    }, [progress])

    return (
        <div className="bg-[#333333] h-[100vh] flex flex-col">
            <div className="grid grid-flow-col auto-cols-max pt-3 px-3 gap-3 opacity-0 hover:opacity-100 transition-opacity	fixed min-w-full h-[40px] shadow-[inset_2px_25px_25px_-26px_#000000]">
                <div
                    className="h-[12px] w-[12px] bg-red-500 hover:bg-[#b52424] rounded-full"
                    onClick={() => {
                        window.Main.Close()
                    }}
                ></div>
                <div
                    className="h-[12px] w-[12px] bg-yellow-500 hover:bg-[#939624] rounded-full"
                    onClick={() => {
                        window.Main.Minimize()
                    }}
                ></div>
            </div>
            <div className="bg-[#333333] drag">
                <div className="flex">
                    <div className="no-drag p-3 pl-4 pb-2 ">
                        <div className="flex-none w-[64px] h-[64px]">
                            <img
                                className="no-drag mt-1 rounded-lg duration-300 hover:sepia hover:scale-125 hover:shadow-[0_10px_20px_rgba(0,_0,_0,_0.7)] hover:rotate-2 transition-[
                                transition-property: transform, shadow, opacity;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 150ms;] 
                                "
                                src={
                                    cover !== undefined && cover !== null
                                        ? `data:${cover};base64,${cover.toString(
                                              'base64'
                                          )}`
                                        : ''
                                }
                                onClick={() => {
                                    downloadCover(cover)
                                }}
                                alt=""
                                title="Click to download the cover art"
                            />
                        </div>
                    </div>
                    <div className="ml-1 mt-3 flex-1">
                        <p className="no-drag text-[#a1918c] transition-colors duration-1000 hover:text-transparent animate-shine">
                            {title}
                        </p>
                        <div className="no-drag text-[#6e635f] grid grid-flow-col auto-cols-max transition-colors duration-1000 hover:text-transparent animate-shine">
                            <p>{artist}</p>
                            <p>&nbsp;-&nbsp;</p>
                            <p>{album}</p>
                        </div>
                        <div
                            className="no-drag"
                            id="track"
                            // This id value needed as using e.target can target the child
                            // latter being the track knob which has its own bounds.
                            // This causes unexpected bahaviour
                            onMouseMove={(e) => {
                                relativeCoords(e)
                            }}
                            onMouseDown={() => setMouseDown(true)}
                            onMouseLeave={() => setMouseDown(false)}
                            onMouseUp={() => setMouseDown(false)}
                        >
                            <svg
                                width="150"
                                height="20"
                                viewBox="0 0 800 80"
                                className="no-drag clip1 absolute bg-black/30  rounded-md"
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
                                            strokeWidth="12"
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
                                            strokeWidth="12"
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
                                className="clip1 absolute bg-black/30 rounded-md"
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
                                        strokeWidth="12"
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
                <div className="flex flex-row justify-between mt-1 mx-2">
                    <div className="flex">
                        {resized ? (
                            <Bars3Icon
                                className="no-drag h-6 text-[#a1918c] m-1"
                                onClick={collapse}
                            />
                        ) : (
                            <ChevronDoubleUpIcon
                                className="no-drag h-6 text-[#a1918c] m-1"
                                onClick={collapse}
                            />
                        )}

                        <AdjustmentsVerticalIcon className="no-drag h-6 text-[#a1918c] m-1" />
                    </div>
                    <div className="flex">
                        <BackwardIcon
                            className="no-drag h-6 text-[#a1918c] m-1"
                            onClick={() => {
                                openFile(currIdx - 1)
                            }}
                        />
                        {play ? (
                            <PauseIcon
                                className="no-drag h-6 text-[#a1918c] m-1"
                                onClick={() => togglePlay()}
                            />
                        ) : (
                            <PlayIcon
                                className="no-drag h-6 text-[#a1918c] m-1"
                                onClick={() => togglePlay()}
                            />
                        )}
                        <ForwardIcon
                            className="no-drag h-6 text-[#a1918c] m-1"
                            onClick={() => {
                                openFile(currIdx + 1)
                            }}
                        />
                        <SpeakerWaveIcon className="no-drag h-6 text-[#a1918c] m-1" />
                        <input
                            className="no-drag accent-[#a1918c] bg-inherit w-[100px]"
                            type="range"
                            min="0"
                            value={volume}
                            step="0.01"
                            max="1"
                            onChange={(e) =>
                                setVolume(parseFloat(e.target.value))
                            }
                        ></input>
                    </div>
                    <div className="flex">
                        <ArrowPathRoundedSquareIcon
                            className={
                                repeat
                                    ? 'no-drag h-6 text-[#f08665] m-1'
                                    : 'no-drag h-6 text-[#a1918c] m-1'
                            }
                            onMouseDown={() => {
                                setRepeat(!repeat)
                            }}
                        />
                        <CogIcon
                            className="no-drag h-6 text-[#a1918c] m-1"
                            onClick={() => {
                                openSettings()
                            }}
                        />
                        {onTop ? (
                            <DocumentArrowDownIcon
                                className="no-drag h-6 text-[#f08665] m-1"
                                onClick={alwaysOnTop}
                            />
                        ) : (
                            <DocumentArrowUpIcon
                                className="no-drag h-6 text-[#a1918c] m-1"
                                onClick={alwaysOnTop}
                            />
                        )}
                        <FolderPlusIcon
                            className="no-drag h-6 text-[#a1918c] m-1"
                            onClick={() => {
                                openDir(false)
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-[#2a2a2a] min-h-[20px] flex-none place-items-center p-1">
                <div className="flex flex-row">
                    <div className="text-white text-xs ml-1 mt-1 p-1 rounded-md bg-white/20">
                        Music
                    </div>
                    <div className="text-white w-[24px] text-center text-xs mt-1 p-1 rounded-md bg-white/20 ml-auto mr-1">
                        +
                    </div>
                </div>
            </div>

            <div className="overflow-y-auto flex-1 flex-grow bg-black/30">
                {covers.length > 0 &&
                    files.map((file: string, index: number) => {
                        return (
                            <div
                                key={index}
                                className="px-2 py-1 overflow-auto hover:scale-[101%] transition-transform"
                            >
                                <div
                                    className={`${
                                        index == 0
                                            ? 'border-b-[1px]'
                                            : 'border-b-[1px]'
                                    }  ${
                                        index == currIdx
                                            ? 'bg-[#f08665]/10'
                                            : ''
                                    }
                                        border-[#f08665] hover:bg-black/20 flex flex-row p-1 text-center rounded-md`}
                                    onClick={() => {
                                        openFile(index)
                                    }}
                                >
                                    <img
                                        className="w-[24px] h-[24px] rounded-lg flex-none"
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
                                    <div className="text-[#a1918c] text-sm place-items-center ml-2 whitespace-nowrap overflow-hidden text-ellipsis">
                                        {file
                                            .split('/')
                                            .reverse()[0]
                                            .replace(/\.[^/.]+$/, '')}
                                    </div>

                                    <div className="flex place-items-center ml-auto">
                                        <div className="bg-slate-400/10 grid grid-flow-col rounded-md text-xs p-1">
                                            <p className="text-[#a1918c]">
                                                {formats[index] !== undefined &&
                                                formats[index] !== null
                                                    ? formats[index]
                                                    : ''}
                                            </p>
                                            <p className="text-[#a1918c]">
                                                &nbsp;/&nbsp;
                                            </p>
                                            <p className="text-[#a1918c]">
                                                {sampleRates[index] !==
                                                    undefined &&
                                                sampleRates[index] !== null
                                                    ? sampleRates[index]
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
            </div>
            <div className="drag bg-[#333333] min-h-[20px] flex-none place-items-center p-1">
                <div className="flex flex-row">
                    <p className="text-left text-sm ml-1 w-[50%] overflow-hidden inline-block whitespace-nowrap text-white flex-1">{`Track: ${
                        currIdx + 1
                    } / ${files.length}`}</p>
                    <div className=" mr-1 w-[50%] flex-none inline-block ">
                        <p
                            title={currDir}
                            className="text-sm text-right rtl-grid overflow-hidden whitespace-nowrap text-white  text-ellipsis"
                        >{`${currDir}`}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
