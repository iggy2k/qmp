import React, { useEffect, useState, useRef, useCallback } from 'react'
import { prominent } from 'color.js'
import {
    IconArrowsShuffle,
    IconRepeat,
    IconRepeatOff,
    IconArrowsRight,
    IconPin,
    IconPinFilled,
    IconVolume,
    IconVolume2,
    IconVolume3,
    IconMusic,
} from '@tabler/icons-react'

import {
    PauseIcon,
    PlayIcon,
    ForwardIcon,
    BackwardIcon,
    AdjustmentsVerticalIcon,
    CogIcon,
    Bars3Icon,
    ChevronDoubleUpIcon,
    FolderPlusIcon,
} from '@heroicons/react/24/solid'
import scrollIntoView from 'scroll-into-view-if-needed'

import {
    componentToHex,
    grayness,
    rgbToHex,
    LightenDarkenColor,
    secondsToDhms,
    secondsToDhmsShort,
} from './helpers'

const AudioContext = window.AudioContext
var audioContext: any = null
let track: any = null
let gain: any = null
const audio = new Audio()

function App() {
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

    // Color states
    const [colorOne, setColorOne] = useState('#000000')
    const [colorTwo, setColorTwo] = useState('#000000')
    const [colorThree, setColorThree] = useState('#000000')
    const [colorFour, setColorFour] = useState('#000000')

    // Windows states
    const [onTop, setOnTop] = useState(false)
    const [mouseDown, setMouseDown] = useState(false)
    const [resized, setResized] = useState(false)

    // Current track data states
    const ref = useRef<null | HTMLDivElement>(null)
    const [cover, setCover] = useState(null as any)

    const currCover = useCallback(
        // Get key colors from the cover art:
        // Gets 3 brightest colors that are the furthest from gray,
        // also get 1 dark color
        (node: any) => {
            if (node !== null) {
                prominent(node, { amount: 10 }).then((color) => {
                    let topColors: Record<string, number> = {}
                    if (Array.isArray(color)) {
                        color.forEach((element: any) => {
                            let hex = rgbToHex(
                                element[0],
                                element[1],
                                element[2]
                            ) // Get luminance via rbg magic coefficients
                            topColors[hex] =
                                element[0] * 0.299 +
                                element[1] * 0.587 +
                                element[2] * 0.114
                        })
                    }

                    let keys = Object.keys(topColors)

                    keys.sort(
                        (a, b) =>
                            grayness(b) - grayness(a) ||
                            topColors[b] - topColors[a]
                    )

                    setColorOne(keys[1])
                    setColorTwo(keys[2])
                    setColorThree(keys[3])
                    setColorFour(keys[9]) // Make sure one of the shades is dark
                })
            }
        },
        [cover]
    )

    const [title, setTitle] = useState('Title')
    const [artist, setArtist] = useState('Artist')
    const [album, setAlbum] = useState('Album')
    const [currFile, setCurrFile] = useState('')
    const [currIdx, setCurrIdx] = useState(0)
    const [progress, setProgress] = useState(0)
    const [currDir, setCurrDir] = useState('')
    const [repeat, setRepeat] = useState(false)

    // Current track control states
    const [shuffle, setShuffle] = useState(false)
    const [volume, setVolume] = useState(0.5)
    const [play, setPlay] = useState(false)
    const [currTime, setCurrTime] = useState(0)

    // Track list states
    const [files, setFiles] = useState([])
    const [durations, setDurations] = useState<any[]>([])
    const [names, setNames] = useState<any[]>([])
    const [authors, setAuthors] = useState<any[]>([])
    const [albums, setAlbums] = useState<any[]>([])
    const [sampleRates, setSampleRates] = useState<any[]>([])
    const [covers, setCovers] = useState<any[]>([])
    const [formats, setFormats] = useState<any[]>([])

    const [directories, setDirectories] = useState<string[]>([])

    const downloadCover = (b64data: any) => {
        if (b64data !== undefined) {
            window.Main.SaveCover(b64data.toString('base64'))
        }
    }

    const updateProgress = () => {
        if (audio) {
            let frac = audio.currentTime / audio.duration
            if (frac !== Infinity) {
                let new_progress = Math.trunc(frac * 800)
                let new_time = Math.trunc(frac * 100)
                if (new_progress !== Infinity && !Number.isNaN(new_progress)) {
                    setProgress(new_progress)
                    setCurrTime(new_time)
                }
                if (frac == 1 && play) {
                    togglePlay()
                }
            }
        }
    }

    audio.ontimeupdate = updateProgress

    const openSettings = () => {
        window.Main.send('open-settings-tm', null)
    }

    const togglePlay = () => {
        console.log(`Toggle play -> paused=${audio.paused}`)
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

    // Switch to a new track
    const openFile = (index: number) => {
        if (index < 0) {
            index = files.length - 1
        } else if (index > files.length - 1) {
            index = 0
        }

        setCurrIdx(index)
        setCurrFile(files[index])

        window.Main.send('toMain', [files[index]])
    }

    // Normal way of using react with listeners
    useEffect(() => {
        window.Main.receive('get-files-from-main', (data: any) => {
            if (data.length > 0) {
                setFiles(data)
                const paths = Object.values(data)
                window.Main.send('toMain', paths)
            }
        })
        window.Main.receive('fromMain', (data2: any) => {
            if (data2[1].length == 1) {
                // Case: get current tracks info
                setCover(data2[1][0])
                setTitle(data2[0][0].common['title'])
                setArtist(data2[0][0].common['artist'])
                setAlbum(data2[0][0].common['album'])
            } else if (data2[1].length > 1) {
                // Case: get all tracks in the directory
                setCovers(data2[1])
                setFormats(
                    data2[0].map(
                        (trackData: { [x: string]: { [x: string]: any } }) =>
                            trackData['format']['container']
                    )
                )
                setDurations(
                    data2[0].map(
                        (trackData: { [x: string]: { [x: string]: any } }) =>
                            trackData['format']['duration']
                    )
                )
                setSampleRates(
                    data2[0].map(
                        (trackData: { [x: string]: { [x: string]: any } }) =>
                            trackData['format']['sampleRate']
                    )
                )
                setNames(
                    data2[0].map(
                        (trackData: { [x: string]: { [x: string]: any } }) =>
                            trackData['common']['title']
                    )
                )
                setAlbums(
                    data2[0].map(
                        (trackData: { [x: string]: { [x: string]: any } }) =>
                            trackData['common']['album']
                    )
                )
                setAuthors(
                    data2[0].map(
                        (trackData: { [x: string]: { [x: string]: any } }) =>
                            trackData['common']['artist']
                    )
                )
            }
        })
        return () => {
            console.log('return')
        }
    }, [])

    const openCertainDir = (path: string) => {
        setCurrDir(path)
        window.Main.send('get-files-to-main', path)
    }

    // Load all supported audio files from
    // a directory (recursive)
    const openDir = (openDefault: boolean) => {
        window.Main.send('open-folder-tm', openDefault)
        window.Main.receive('open-folder-fm', (path: string | undefined) => {
            if (path !== undefined) {
                setCurrDir(path)
                !directories.includes(path) &&
                    setDirectories([...directories, path])
                window.Main.send('get-files-to-main', path)
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
    }

    // Get seek time from mouse position on the track
    const relativeCoords = (e: any) => {
        if (!audio) {
            return
        }
        e.stopPropagation()
        let elem = document.getElementById('track')
        var bounds = elem!.getBoundingClientRect()
        var x = e.clientX - bounds.left
        var relative_pos = (audio.duration / 150) * x
        if (mouseDown) {
            setSeek(relative_pos)
        }
    }

    // Hot reload audio handling
    useEffect(() => {
        openDir(true)
        return () => {
            audio.pause()
            setPlay(false)
        }
    }, [])

    useEffect(() => {
        console.log('new')
        audio.play()
        setPlay(true)
    }, [currFile])

    // Open a file on new directory load
    useEffect(() => {
        if (files.length > currIdx) {
            openFile(currIdx)
        } else {
            openFile(0)
        }
    }, [files])

    useEffect(() => {
        if (progress === 800 && !repeat) {
            if (shuffle) {
                openFile(Math.floor(Math.random() * files.length))
            } else {
                openFile(currIdx + 1)
            }
        }
    }, [progress])

    useEffect(() => {
        ref.current &&
            !resized &&
            scrollIntoView(ref.current, {
                behavior: 'smooth',
                scrollMode: 'if-needed',
            })
    }, [currIdx])

    useEffect(() => {
        audio.src = currFile ? `file://${currFile}` : ''
    }, [currFile])

    useEffect(() => {
        audio.loop = repeat
        audio.volume = volume
    }, [repeat, volume])

    return (
        <div className="bg-[#333333] h-[100vh] flex flex-col overflow-y-hidden">
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
            <div
                style={{
                    backgroundImage: `
                    radial-gradient(ellipse at top left, ${colorOne}30  15%, transparent 100%),
                    radial-gradient(ellipse at bottom  left, ${colorTwo}30  15% , transparent 100%),
                    radial-gradient(ellipse at top    right, ${colorThree}30 15% , transparent 100%),
                    radial-gradient(ellipse at bottom right, ${colorFour}30  15% , transparent 100%)`,
                }}
                className="bg-[#333333] drag"
            >
                <div className="flex">
                    <div className="no-drag p-2 pl-2 pb-0">
                        <div className="flex-none w-[64px] h-[64px]">
                            {cover !== undefined && cover !== null ? (
                                <img
                                    ref={currCover}
                                    className="no-drag rounded-lg duration-300 hover:sepia hover:scale-125 hover:shadow-[0_10px_20px_rgba(0,_0,_0,_0.7)] hover:rotate-2 transition-[
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
                            ) : (
                                <IconMusic
                                    style={{
                                        color: LightenDarkenColor(
                                            colorThree,
                                            200
                                        ),
                                        borderRadius: '10px',
                                    }}
                                    className="drag  w-[64px] h-[64px]"
                                    onClick={() => {
                                        openFile(currIdx + 1)
                                    }}
                                />
                            )}
                        </div>
                    </div>
                    <div className="ml-1 mt-2 flex-1">
                        <p
                            style={{
                                color: LightenDarkenColor(colorFour, 200),
                            }}
                            className="no-drag text-[#a1918c] text-sm"
                        >
                            {title?.replace('\\', '')}
                        </p>
                        <div
                            style={{
                                color: LightenDarkenColor(colorThree, 200),
                            }}
                            className="no-drag grid grid-flow-col auto-cols-max text-sm"
                        >
                            <p>{artist}</p>
                            <p>&nbsp;-&nbsp;</p>
                            <p>{album}</p>
                        </div>
                        <div className="w-full h-[20px] flex flex-row">
                            <div
                                className="no-drag w-[150px] flex-initial"
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
                                    className="no-drag clip1 absolute bg-transparent rounded-md"
                                    style={{
                                        clipPath: `inset(0 ${
                                            100 - currTime
                                        }% 0 0)`,
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
                                    className="clip1 absolute bg-transparent rounded-md"
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
                            <div
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="text-xs mr-2 flex-1 text-right"
                            >
                                {secondsToDhmsShort(audio.currentTime)}
                                &nbsp;/&nbsp;
                                {secondsToDhmsShort(durations[currIdx])}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row justify-between mt-1 mx-2">
                    <div className="flex">
                        {resized ? (
                            <Bars3Icon
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-[20px] m-1"
                                onClick={collapse}
                            />
                        ) : (
                            <ChevronDoubleUpIcon
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-[20px] m-1"
                                onClick={collapse}
                            />
                        )}

                        <AdjustmentsVerticalIcon
                            style={{
                                color: LightenDarkenColor(colorThree, 200),
                            }}
                            className="no-drag h-[20px] m-1"
                        />
                        {onTop ? (
                            <IconPinFilled
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-[20px] m-1"
                                onClick={alwaysOnTop}
                            />
                        ) : (
                            <IconPin
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-[20px] m-1"
                                onClick={alwaysOnTop}
                            />
                        )}
                        <CogIcon
                            style={{
                                color: LightenDarkenColor(colorThree, 200),
                            }}
                            className="no-drag h-[20px] m-1"
                            onClick={() => {
                                openSettings()
                            }}
                        />
                    </div>
                    <div className="flex">
                        {repeat ? (
                            <IconRepeat
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-[20px] m-1"
                                onMouseDown={() => {
                                    setRepeat(!repeat)
                                }}
                            />
                        ) : (
                            <IconRepeatOff
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-[20px] m-1"
                                onMouseDown={() => {
                                    setRepeat(!repeat)
                                }}
                            />
                        )}
                        <BackwardIcon
                            style={{
                                color: LightenDarkenColor(colorThree, 200),
                            }}
                            className="no-drag h-[20px] m-1"
                            onClick={() => {
                                openFile(currIdx - 1)
                            }}
                        />
                        {play ? (
                            <PauseIcon
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-[20px] m-1"
                                onClick={() => togglePlay()}
                            />
                        ) : (
                            <PlayIcon
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-[20px] m-1"
                                onClick={() => togglePlay()}
                            />
                        )}
                        <ForwardIcon
                            style={{
                                color: LightenDarkenColor(colorThree, 200),
                            }}
                            className="no-drag h-[20px] m-1"
                            onClick={() => {
                                openFile(currIdx + 1)
                            }}
                        />
                        {shuffle ? (
                            <IconArrowsShuffle
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-[20px] m-1"
                                onClick={() => setShuffle(false)}
                            />
                        ) : (
                            <IconArrowsRight
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-[20px] m-1"
                                onClick={() => setShuffle(true)}
                            />
                        )}
                    </div>
                    <div className="flex">
                        {volume == 0 ? (
                            <IconVolume3
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-[20px] m-1"
                            />
                        ) : volume < 0.5 ? (
                            <IconVolume2
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-[20px] m-1"
                            />
                        ) : (
                            <IconVolume
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-[20px] m-1"
                            />
                        )}

                        <input
                            style={{
                                accentColor: LightenDarkenColor(
                                    colorThree,
                                    200
                                ),
                            }}
                            className="no-drag bg-inherit w-[100px]"
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
                </div>
            </div>

            <div className="bg-[#2a2a2a] min-h-[20px] flex-none place-items-center p-1">
                <div className="flex flex-row">
                    {directories.map((dir: string, index: number) => {
                        return (
                            <div
                                style={{
                                    backgroundColor:
                                        currDir == dir
                                            ? '#00000050'
                                            : '#FFFFFF50',
                                }}
                                onClick={() => {
                                    currDir !== dir && openCertainDir(dir)
                                }}
                                className="text-white h-[24px] text-xs ml-1 mt-1 p-1 rounded-md bg-white/20"
                            >
                                {directories[index].split('/').reverse()[0]}
                            </div>
                        )
                    })}
                    <FolderPlusIcon
                        style={{
                            color: LightenDarkenColor(colorThree, 200),
                        }}
                        className="no-drag h-[24px] m-1 ml-auto mr-1"
                        onClick={() => {
                            openDir(false)
                        }}
                    />
                </div>
            </div>

            <div
                style={{
                    backgroundColor: colorOne + '10',
                }}
                className="overflow-y-auto flex-1 flex-grow overflow-x-hidden"
            >
                {covers.length > 0 &&
                    files.map((file: string, index: number) => {
                        console.log(index)
                        return (
                            <div
                                style={{
                                    paddingTop: index == 0 ? '5px' : '1px',
                                    paddingBottom:
                                        index == files.length - 1
                                            ? '5px'
                                            : '1px',
                                    paddingLeft: '0.5rem',
                                    paddingRight: '0.5rem',
                                }}
                                key={index}
                                ref={index == currIdx ? ref : null}
                                className="overflow-auto hover:scale-[101%] transition-transform"
                            >
                                <div
                                    style={{
                                        backgroundColor:
                                            index == currIdx
                                                ? colorOne + '20'
                                                : '',
                                    }}
                                    className="transition duration-75 hover:bg-black/20 flex flex-row p-[1px] text-center rounded-md"
                                    onClick={() => {
                                        openFile(index)
                                    }}
                                >
                                    {covers[index] !== undefined &&
                                    covers[index] !== null ? (
                                        <img
                                            className="w-[24px] h-[24px] rounded-lg flex-none"
                                            src={`data:${
                                                covers[index]
                                            };base64,${covers[index].toString(
                                                'base64'
                                            )}`}
                                            alt=""
                                        />
                                    ) : (
                                        <IconMusic
                                            style={{
                                                color: LightenDarkenColor(
                                                    colorThree,
                                                    200
                                                ),
                                            }}
                                            className="drag min-w-[24px] min-h-[24px] max-w-[24px] max-h-[24px]"
                                            onClick={() => {
                                                openFile(currIdx + 1)
                                            }}
                                        />
                                    )}

                                    <div
                                        style={{
                                            color: LightenDarkenColor(
                                                colorThree,
                                                200
                                            ),
                                        }}
                                        className="text-sm place-items-center ml-2 whitespace-nowrap overflow-hidden text-ellipsis"
                                    >
                                        {names[index] &&
                                        authors[index] &&
                                        albums[index] ? (
                                            <div className="flex flex-row">
                                                <p
                                                    style={{
                                                        color: LightenDarkenColor(
                                                            colorFour,
                                                            200
                                                        ),
                                                    }}
                                                    // className="font-semibold"
                                                >
                                                    {names[index].replace(
                                                        '\\',
                                                        ''
                                                    )}
                                                </p>
                                                <p
                                                    style={{
                                                        color: LightenDarkenColor(
                                                            colorFour,
                                                            150
                                                        ),
                                                    }}
                                                    className="ml-1"
                                                >
                                                    {authors[index].replace(
                                                        '\\',
                                                        ''
                                                    )}
                                                </p>
                                                <p
                                                    style={{
                                                        color: LightenDarkenColor(
                                                            colorFour,
                                                            100
                                                        ),
                                                    }}
                                                    className="ml-1"
                                                >
                                                    {albums[index].replace(
                                                        '\\',
                                                        ''
                                                    )}
                                                </p>
                                            </div>
                                        ) : (
                                            <p>
                                                {' '}
                                                {file
                                                    .split('/')
                                                    .reverse()[0]
                                                    .replace(/\.[^/.]+$/, '')}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex place-items-center ml-auto">
                                        <div
                                            style={{
                                                fontSize: '0.65rem',
                                                lineHeight: '1.1rem',
                                                color: LightenDarkenColor(
                                                    colorFour,
                                                    200
                                                ),
                                                backgroundColor:
                                                    LightenDarkenColor(
                                                        colorThree,
                                                        0
                                                    ),
                                            }}
                                            className="pl-1 grid grid-flow-col text-xs font-mono rounded-md"
                                        >
                                            <p>
                                                {formats[index] !== undefined &&
                                                formats[index] !== null
                                                    ? formats[index]
                                                    : ''}
                                            </p>
                                            <p>&nbsp;</p>
                                            <p
                                                className="rounded-md pl-1 pr-1"
                                                style={{
                                                    backgroundColor:
                                                        LightenDarkenColor(
                                                            colorFour,
                                                            50
                                                        ),
                                                }}
                                            >
                                                {sampleRates[index] !==
                                                    undefined &&
                                                sampleRates[index] !== null
                                                    ? Math.trunc(
                                                          sampleRates[index] /
                                                              1000
                                                      ) + 'kHz'
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
                    <p className="text-left text-sm ml-1 w-[30%] overflow-hidden inline-block whitespace-nowrap text-white flex-1">{`${
                        currIdx + 1
                    } / ${files.length}`}</p>
                    <p className=" text-left text-sm ml-1 w-[30%] overflow-hidden inline-block whitespace-nowrap text-white flex-1">
                        {secondsToDhms(
                            durations.reduce((acc: number, curr: number) => {
                                return acc + curr
                            }, 0)
                        )}
                    </p>
                    <div className=" mr-1 w-[30%] flex-none inline-block ">
                        <p
                            title={currDir}
                            className="text-sm text-right rtl-grid overflow-hidden whitespace-nowrap text-white  text-ellipsis"
                        >
                            {`${currDir}`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
