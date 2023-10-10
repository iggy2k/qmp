import React, { useEffect, useState, useRef } from 'react'
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
    SpeakerWaveIcon,
    CogIcon,
    Bars3Icon,
    ChevronDoubleUpIcon,
    FolderPlusIcon,
} from '@heroicons/react/24/solid'
import scrollIntoView from 'scroll-into-view-if-needed'

const AudioContext = window.AudioContext
var audioContext: any = null
let duration = 0
let track: any = null
let gain: any = null
const audio = new Audio()

function componentToHex(c: number) {
    var hex = c.toString(16)
    return hex.length == 1 ? '0' + hex : hex
}

function grayness(hex: string) {
    if (hex[0] == '#') {
        hex = hex.slice(1)
    }
    let r = parseInt(hex.slice(0, 2), 16)
    let g = parseInt(hex.slice(2, 4), 16)
    let b = parseInt(hex.slice(4, 6), 16)
    return Math.abs(r - g) + Math.abs(r - b) + Math.abs(b - g)
}

function rgbToHex(r: number, g: number, b: number) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

// Author: https://css-tricks.com/snippets/javascript/lighten-darken-color/
function LightenDarkenColor(col: string, amt: number) {
    var usePound = false

    if (col[0] == '#') {
        col = col.slice(1)
        usePound = true
    }

    var num = parseInt(col, 16)

    var r = (num >> 16) + amt

    if (r > 255) r = 255
    else if (r < 0) r = 0

    var b = ((num >> 8) & 0x00ff) + amt

    if (b > 255) b = 255
    else if (b < 0) b = 0

    var g = (num & 0x0000ff) + amt

    if (g > 255) g = 255
    else if (g < 0) g = 0

    return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16)
}

function secondsToDhms(seconds: number) {
    seconds = Number(seconds)
    var d = Math.floor(seconds / (3600 * 24))
    var h = Math.floor((seconds % (3600 * 24)) / 3600)
    var m = Math.floor((seconds % 3600) / 60)
    var s = Math.floor(seconds % 60)

    var dDisplay = d + 'd '
    var hDisplay = h + 'h '
    var mDisplay = m + 'm '
    var sDisplay = s + 's '
    return dDisplay + hDisplay + mDisplay + sDisplay
}

function secondsToDhmsShort(seconds: number) {
    seconds = Number(seconds)
    var d = Math.floor(seconds / (3600 * 24))
    var h = Math.floor((seconds % (3600 * 24)) / 3600)
    var m = Math.floor((seconds % 3600) / 60)
    var s = Math.floor(seconds % 60)

    var dDisplay = d > 0 ? (d < 10 ? '0' + d : d) + ' : ' : ''
    var hDisplay = h > 0 ? (h < 10 ? '0' + h : h) + ' : ' : ''
    var mDisplay = m > 0 ? (m < 10 ? '0' + m : m) + ' : ' : '00 : '
    var sDisplay = s > 0 ? (s < 10 ? '0' + s : s) + '' : '00'
    return dDisplay + hDisplay + mDisplay + sDisplay
}

function App() {
    const currCover = useRef(null)
    const [volume, setVolume] = useState(0.5)

    const downloadCover = (b64data: any) => {
        if (b64data !== undefined) {
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

    const ref = useRef<null | HTMLDivElement>(null)

    const [colorOne, setColorOne] = useState('#000000')
    const [colorTwo, setColorTwo] = useState('#000000')
    const [colorThree, setColorThree] = useState('#000000')
    const [colorFour, setColorFour] = useState('#000000')

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

    const [durations, setDurations] = useState<any[]>([])

    const [names, setNames] = useState<any[]>([])

    const [authors, setAuthors] = useState<any[]>([])

    const [albums, setAlbums] = useState<any[]>([])

    const [sampleRates, setSampleRates] = useState<any[]>([])

    const [mouseDown, setMouseDown] = useState(false)

    const [shuffle, setShuffle] = useState(false)

    const updateProgress = () => {
        if (audio) {
            let frac = audio.currentTime / duration
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
            setCover(data[1][0])
            console.log(data[0][0])
            setTitle(data[0][0].common['title'])
            setArtist(data[0][0].common['artist'])
            setAlbum(data[0][0].common['album'])
            if (audio && !Number.isNaN(audio.duration)) {
                duration = audio.duration
                console.log('duration = ' + duration)
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
                                setCovers(data2[1])
                                setFormats(
                                    data2[0].map(
                                        (trackData: {
                                            [x: string]: { [x: string]: any }
                                        }) => trackData['format']['container']
                                    )
                                )
                                setDurations(
                                    data2[0].map(
                                        (trackData: {
                                            [x: string]: { [x: string]: any }
                                        }) => trackData['format']['duration']
                                    )
                                )
                                setSampleRates(
                                    data2[0].map(
                                        (trackData: {
                                            [x: string]: { [x: string]: any }
                                        }) => trackData['format']['sampleRate']
                                    )
                                )
                                setNames(
                                    data2[0].map(
                                        (trackData: {
                                            [x: string]: { [x: string]: any }
                                        }) => trackData['common']['title']
                                    )
                                )
                                setAlbums(
                                    data2[0].map(
                                        (trackData: {
                                            [x: string]: { [x: string]: any }
                                        }) => trackData['common']['album']
                                    )
                                )
                                setAuthors(
                                    data2[0].map(
                                        (trackData: {
                                            [x: string]: { [x: string]: any }
                                        }) => trackData['common']['artist']
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
    }

    useEffect(() => {
        console.log('audio.paused = ' + audio.paused)
        if (currDir === '') {
            // Prevent hot-reaload infinite-loop
            openDir(true)
        }
        if (audio && !audio.paused) {
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
        prominent(currCover.current!, { amount: 10 }).then((color) => {
            let topColors: Record<string, number> = {}
            if (Array.isArray(color)) {
                color.forEach((element: any) => {
                    let hex = rgbToHex(element[0], element[1], element[2])
                    topColors[hex] =
                        element[0] * 0.299 +
                        element[1] * 0.587 +
                        element[2] * 0.114
                })
            }

            let keys = Object.keys(topColors)

            keys.sort(
                (a, b) =>
                    grayness(b) - grayness(a) || topColors[b] - topColors[a]
            )

            keys.forEach((element) => {
                console.log(`${element} = ${grayness(element)}`)
            })

            setColorOne(keys[1])
            // console.log(keys[1] + ' ' + topColors[keys[1]])
            setColorTwo(keys[2])
            // console.log(keys[2] + ' ' + topColors[keys[2]])
            setColorThree(keys[3])
            // console.log(keys[3] + ' ' + topColors[keys[3]])
            setColorFour(keys[9])
            // console.log(keys[4] + ' ' + topColors[keys[4]])
        })
    }, [cover])

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
            scrollIntoView(ref.current, {
                behavior: 'smooth',
                scrollMode: 'if-needed',
            })
    }, [currIdx])

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
                    <div className="no-drag p-3 pl-4 pb-0">
                        <div className="flex-none w-[64px] h-[64px]">
                            {cover !== undefined && cover !== null ? (
                                <img
                                    ref={currCover}
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
                    <div className="ml-1 mt-3 flex-1">
                        <p
                            style={{
                                color: LightenDarkenColor(colorFour, 200),
                            }}
                            className="no-drag text-[#a1918c]"
                        >
                            {title?.replace('\\', '')}
                        </p>
                        <div
                            style={{
                                color: LightenDarkenColor(colorThree, 200),
                            }}
                            className="no-drag grid grid-flow-col auto-cols-max"
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
                                className="no-drag h-6 m-1"
                                onClick={collapse}
                            />
                        ) : (
                            <ChevronDoubleUpIcon
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-6 m-1"
                                onClick={collapse}
                            />
                        )}

                        <AdjustmentsVerticalIcon
                            style={{
                                color: LightenDarkenColor(colorThree, 200),
                            }}
                            className="no-drag h-6 m-1"
                        />
                        {onTop ? (
                            <IconPinFilled
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-6 m-1"
                                onClick={alwaysOnTop}
                            />
                        ) : (
                            <IconPin
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-6 m-1"
                                onClick={alwaysOnTop}
                            />
                        )}
                        <FolderPlusIcon
                            style={{
                                color: LightenDarkenColor(colorThree, 200),
                            }}
                            className="no-drag h-6 m-1"
                            onClick={() => {
                                openDir(false)
                            }}
                        />
                        <CogIcon
                            style={{
                                color: LightenDarkenColor(colorThree, 200),
                            }}
                            className="no-drag h-6 m-1"
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
                                className="no-drag h-6 m-1"
                                onMouseDown={() => {
                                    setRepeat(!repeat)
                                }}
                            />
                        ) : (
                            <IconRepeatOff
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-6 m-1"
                                onMouseDown={() => {
                                    setRepeat(!repeat)
                                }}
                            />
                        )}
                        <BackwardIcon
                            style={{
                                color: LightenDarkenColor(colorThree, 200),
                            }}
                            className="no-drag h-6 m-1"
                            onClick={() => {
                                openFile(currIdx - 1)
                            }}
                        />
                        {play ? (
                            <PauseIcon
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-6 m-1"
                                onClick={() => togglePlay()}
                            />
                        ) : (
                            <PlayIcon
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-6 m-1"
                                onClick={() => togglePlay()}
                            />
                        )}
                        <ForwardIcon
                            style={{
                                color: LightenDarkenColor(colorThree, 200),
                            }}
                            className="no-drag h-6 m-1"
                            onClick={() => {
                                openFile(currIdx + 1)
                            }}
                        />
                        {shuffle ? (
                            <IconArrowsShuffle
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-6 m-1"
                                onClick={() => setShuffle(false)}
                            />
                        ) : (
                            <IconArrowsRight
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-6 m-1"
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
                                className="no-drag h-6 m-1"
                            />
                        ) : volume < 0.5 ? (
                            <IconVolume2
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-6 m-1"
                            />
                        ) : (
                            <IconVolume
                                style={{
                                    color: LightenDarkenColor(colorThree, 200),
                                }}
                                className="no-drag h-6 m-1"
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
                    <div className="text-white text-xs ml-1 mt-1 p-1 rounded-md bg-white/20">
                        Music
                    </div>
                    <div className="text-white w-[24px] text-center text-xs mt-1 p-1 rounded-md bg-white/20 ml-auto mr-1">
                        +
                    </div>
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
                        return (
                            <div
                                style={{
                                    paddingTop: currIdx == 0 ? '5px' : '1px',
                                    paddingBottom:
                                        currIdx == files.length - 1
                                            ? '5px'
                                            : '',
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
                                    className="transition duration-75 hover:bg-black/20  flex flex-row p-1 text-center rounded-md"
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
                                                    className="font-semibold"
                                                >
                                                    {names[index]}
                                                </p>
                                                <p
                                                    style={{
                                                        color: LightenDarkenColor(
                                                            colorFour,
                                                            150
                                                        ),
                                                    }}
                                                    className="ml-1 font-normal"
                                                >
                                                    {authors[index]}
                                                </p>
                                                <p
                                                    style={{
                                                        color: LightenDarkenColor(
                                                            colorFour,
                                                            100
                                                        ),
                                                    }}
                                                    className="ml-1 font-light"
                                                >
                                                    {albums[index]}
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
                                        <div className="bg-slate-400/10 grid grid-flow-col rounded-md text-xs p-1 font-mono">
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
