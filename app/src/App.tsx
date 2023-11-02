import React, {
    useEffect,
    useState,
    useRef,
    useCallback,
    memo,
    useMemo,
    useLayoutEffect,
} from 'react'
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

import { FixedSizeList as List } from 'react-window'

import {
    componentToHex,
    grayness,
    rgbToHex,
    LightenDarkenColor,
    secondsToDhms,
    secondsToDhmsShort,
} from './helpers'

const AudioContext = window.AudioContext
// var audioContext: AudioContext = null
let track: any = null
let gain: any = null
const audio = new Audio()

function App() {
    const [colors, setColors] = useState([
        '#000000',
        '#000000',
        '#000000',
        '#000000',
    ])

    // Current track data states
    const listRef = useRef<null | any>(null)
    const trackCoverRef = useRef<null | HTMLImageElement>(null)
    const [electronWindowHeight, setElectronWindowHeight] = useState(450)

    // Track list states
    const [fileListFlick, setFileListFlick] = useState(0)
    const [files, setFiles] = useState<any[]>([])
    const [durations, setDurations] = useState<any[]>([])
    const [names, setNames] = useState<any[]>([])
    const [authors, setAuthors] = useState<any[]>([])
    const [albums, setAlbums] = useState<any[]>([])
    const [sampleRates, setSampleRates] = useState<any[]>([])
    const [covers, setCovers] = useState<any[]>([])
    const [formats, setFormats] = useState<any[]>([])
    const [directories, setDirectories] = useState<string[]>([])

    const [currIdx, setCurrIdx] = useState(-1)
    const [currDir, setCurrDir] = useState('')

    const [play, setPlay] = useState(false)
    const [currTime, setCurrTime] = useState(0)
    const [mouseDown, setMouseDown] = useState(false)
    const [progress, setProgress] = useState(0)
    const [volume, setVolume] = useState(0.5)
    const [shuffle, setShuffle] = useState(false)
    const [onTop, setOnTop] = useState(false)
    const [resized, setResized] = useState(false)
    const [repeat, setRepeat] = useState(false)

    const Row = ({ index, style }: any) => (
        <div
            style={style}
            key={index}
            className={`overflow-auto h-7 px-2 ${index == 0 ? 'pt-1' : ''} ${
                index == files.length - 1 ? 'pb-1' : ''
            }`}
        >
            <div
                style={{
                    backgroundColor: index == currIdx ? '#888888' + '20' : '',
                }}
                className="hover:bg-black/20 transition-opacity duration-300 flex flex-row p-[1px] text-center rounded-md"
                onClick={() => {
                    openFile(index)
                }}
            >
                {covers[index] !== undefined && covers[index] !== null ? (
                    <img
                        className="w-[24px] h-[24px] rounded-lg flex-none"
                        src={covers[index]}
                        alt=""
                    />
                ) : (
                    <IconMusic
                        className="drag min-w-[24px] min-h-[24px] max-w-[24px] max-h-[24px] text-white"
                        onClick={() => {
                            openFile(currIdx + 1)
                        }}
                    />
                )}

                <div className="text-sm place-items-center ml-2 whitespace-nowrap overflow-hidden text-ellipsis text-white/70">
                    {names[index] && authors[index] && albums[index] ? (
                        <div className="flex flex-row">
                            <p className="text-white/80">
                                {names[index].replace('\\', '')}
                            </p>
                            <p className="ml-1 text-white/50">
                                {authors[index].replace('\\', '')}
                            </p>
                            <p className="ml-1 text-white/30">
                                {albums[index].replace('\\', '')}
                            </p>
                        </div>
                    ) : (
                        <p>
                            {' '}
                            {files[index]
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
                        }}
                        className="pl-1 grid grid-flow-col text-xs font-mono rounded-md text-white/80 bg-black/80"
                    >
                        <p>
                            {formats[index] !== undefined &&
                            formats[index] !== null
                                ? formats[index]
                                : ''}
                        </p>
                        <p>&nbsp;</p>
                        <p className="rounded-md pl-1 pr-1 bg-white/80 text-black/80">
                            {sampleRates[index] !== undefined &&
                            sampleRates[index] !== null
                                ? Math.trunc(sampleRates[index] / 1000) + 'kHz'
                                : ''}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )

    // Switch to a new track
    const openFile = (index: number) => {
        if (index < 0) {
            index = files.length - 1
        } else if (index > files.length - 1) {
            index = 0
        }
        setProgress(0)
        setCurrTime(0)
        setCurrIdx(index)
        setFileListFlick(fileListFlick + 1)
    }

    const togglePlay = () => {
        if (audio) {
            if (audio.paused) {
                audio.play()
                setPlay(true)
            } else {
                audio.pause()
                setPlay(false)
            }
        }
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

    function updateColors() {
        trackCoverRef.current &&
            prominent(trackCoverRef.current, { amount: 20 }).then((color) => {
                let topColors: Record<string, number> = {}
                if (Array.isArray(color)) {
                    color.forEach((element: any) => {
                        let hex = rgbToHex(element[0], element[1], element[2]) // Get luminance via rbg magic coefficients
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
                        Math.abs(topColors[b] - topColors[a])
                )

                setColors([keys[0], keys[1], keys[2], keys[keys.length - 1]])
            })
    }

    const removeDir = (e: any, idx: number) => {
        if (directories.length < 2) {
            return
        }
        e.stopPropagation()
        setDirectories(directories.filter((dir) => dir !== directories[idx]))
        setFileListFlick(fileListFlick + 1)
    }

    useEffect(() => {
        console.log('directories = ' + directories)
    }, [directories])

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
        if (
            mouseDown &&
            !Number.isNaN(relative_pos) &&
            relative_pos !== Infinity
        ) {
            setSeek(relative_pos)
            console.log('relative_pos ' + relative_pos)
        }
    }

    const openCertainDir = (path: string) => {
        setCurrDir(path)
        window.Main.send('get-files-to-main', path)
        setFileListFlick(fileListFlick + 1)
    }

    // Load all supported audio files from
    // a directory (recursive)
    const openDir = (openDefault: boolean) => {
        window.Main.send('open-folder-tm', openDefault)
        setFileListFlick(fileListFlick + 1)
    }

    const setSeek = (time: number) => {
        if (audio) {
            audio.currentTime = time
        }
    }

    const downloadCover = (b64data: any) => {
        if (b64data !== undefined) {
            window.Main.SaveCover(b64data.toString('base64'))
        }
    }

    const openSettings = () => {
        window.Main.send('open-settings-tm', null)
    }

    const FileList = useMemo(
        () => (
            <List
                ref={listRef}
                className={`list ${fileListFlick}`}
                height={electronWindowHeight - 165}
                itemCount={files.length}
                itemSize={30}
                width={'100%'}
            >
                {Row}
            </List>
        ),
        [files, fileListFlick, currIdx, electronWindowHeight]
    )

    useEffect(() => {
        !directories.includes(currDir) &&
            currDir &&
            setDirectories([...directories, currDir])
    }, [currDir])

    useEffect(() => {
        audio.loop = repeat
        audio.volume = volume
    }, [repeat, volume])

    useEffect(() => {
        if (listRef.current && !resized) {
            listRef.current.scrollToItem(currIdx, 'smart')
        }
        if (!audio.paused) {
            audio.pause()
            setPlay(false)
        }
        audio.src = files[currIdx] ? `file://${files[currIdx]}` : ''
        updateColors()
        if (play) {
            togglePlay()
        }
    }, [currIdx])

    // Normal way of using react with listeners
    useEffect(() => {
        audio.ontimeupdate = updateProgress
        window.Main.receive('get-height-from-main', (height: number) => {
            console.log(height)
            setElectronWindowHeight(height)
        })
        window.Main.receive('open-folder-fm', (path: string | undefined) => {
            if (path !== undefined) {
                setCurrDir(path)
                window.Main.send('get-files-to-main', path)
            }
        })
        window.Main.receive('get-files-from-main', (data: any) => {
            if (data.length > 0) {
                setFiles(data)
                const paths = Object.values(data)
                window.Main.send('toMain', paths)
            }
        })
        window.Main.receive('fromMain', (data2: any) => {
            if (data2[1].length > 1) {
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
                setCurrIdx(0)
                setFileListFlick(fileListFlick + 1)
            }
        })
        openDir(true)
        return () => {
            audio.pause()
        }
    }, [])

    useEffect(() => {
        if (progress === 800 && !repeat) {
            if (shuffle) {
                openFile(Math.floor(Math.random() * files.length))
            } else {
                openFile(currIdx + 1)
            }
        }
    }, [progress])

    return (
        <div className="bg-[#333333] h-[100vh] flex flex-col overflow-y-hidden">
            <div className="grid grid-flow-col auto-cols-max pt-3 px-3 gap-3 opacity-0 hover:opacity-100 transition-opacity	fixed min-w-full h-[40px] shadow-[inset_2px_25px_25px_-26px_#000000]">
                <div
                    className="no-drag h-[12px] w-[12px] bg-red-500 hover:bg-[#b52424] rounded-full"
                    onClick={() => {
                        window.Main.Close()
                    }}
                ></div>
                <div
                    className="no-drag h-[12px] w-[12px] bg-yellow-500 hover:bg-[#939624] rounded-full"
                    onClick={() => {
                        window.Main.Minimize()
                    }}
                ></div>
            </div>
            <div>
                <div
                    style={{
                        backgroundImage: `
            radial-gradient(ellipse at top left, ${colors[0]}30  15%, transparent 100%),
            radial-gradient(ellipse at bottom  left, ${colors[1]}30  15% , transparent 100%),
            radial-gradient(ellipse at top    right, ${colors[2]}30 15% , transparent 100%),
            radial-gradient(ellipse at bottom right, ${colors[3]}30  15% , transparent 100%)`,
                        backgroundColor: 'transparent',
                    }}
                    className="bg-[#333333] drag"
                >
                    <div className="flex">
                        <div className="no-drag p-2 pl-2 pb-0">
                            <div className="flex-none w-[64px] h-[64px]">
                                {covers[currIdx] !== undefined &&
                                covers[currIdx] !== null ? (
                                    <img
                                        ref={trackCoverRef}
                                        className="no-drag rounded-lg duration-150 hover:scale-110 hover:shadow-[0_10px_20px_rgba(0,_0,_0,_0.7)] transition-[
                                transition-property: transform, shadow, opacity;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 150ms;] 
                                "
                                        src={
                                            covers[currIdx] !== undefined &&
                                            covers[currIdx] !== null
                                                ? covers[currIdx]
                                                : ''
                                        }
                                        onClick={() => {
                                            downloadCover(covers[currIdx])
                                        }}
                                        alt=""
                                        title="Click to download the cover art"
                                    />
                                ) : (
                                    <IconMusic
                                        style={{
                                            color: LightenDarkenColor(
                                                colors[2],
                                                200
                                            ),
                                        }}
                                        className="drag  w-[64px] h-[64px] rounded-[10px]"
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
                                    color: LightenDarkenColor(colors[3], 200),
                                }}
                                className="no-drag text-[#a1918c] text-sm"
                            >
                                {files[currIdx] &&
                                    files[currIdx]
                                        .split('/')
                                        .reverse()[0]
                                        .replace(/\.[^/.]+$/, '')}
                            </p>
                            <div
                                style={{
                                    color: LightenDarkenColor(colors[2], 200),
                                }}
                                className="drag grid grid-flow-col auto-cols-max text-sm"
                            >
                                <p>
                                    {authors[currIdx] ||
                                        (files[currIdx] &&
                                            files[currIdx]
                                                .split('/')
                                                .reverse()[0]
                                                .replace(/\.[^/.]+$/, ''))}
                                </p>
                                <p>
                                    &nbsp;{!authors[currIdx] || '-'}
                                    &nbsp;
                                </p>
                                <p>{albums[currIdx]}</p>
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
                                                    style={{
                                                        stroke: LightenDarkenColor(
                                                            colors[2],
                                                            200
                                                        ),
                                                    }}
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
                                                    style={{
                                                        stroke: LightenDarkenColor(
                                                            colors[2],
                                                            200
                                                        ),
                                                    }}
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
                                                style={{
                                                    stroke: LightenDarkenColor(
                                                        colors[2],
                                                        200
                                                    ),
                                                }}
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
                                            style={{
                                                fill: mouseDown
                                                    ? LightenDarkenColor(
                                                          colors[2],
                                                          200
                                                      )
                                                    : LightenDarkenColor(
                                                          colors[2],
                                                          150
                                                      ),
                                            }}
                                        />
                                    </svg>
                                </div>
                                <div
                                    style={{
                                        color: LightenDarkenColor(
                                            colors[2],
                                            200
                                        ),
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
                                        color: LightenDarkenColor(
                                            colors[2],
                                            200
                                        ),
                                    }}
                                    className="no-drag h-[20px] m-1"
                                    onClick={collapse}
                                />
                            ) : (
                                <ChevronDoubleUpIcon
                                    style={{
                                        color: LightenDarkenColor(
                                            colors[2],
                                            200
                                        ),
                                    }}
                                    className="no-drag h-[20px] m-1"
                                    onClick={collapse}
                                />
                            )}

                            <AdjustmentsVerticalIcon
                                style={{
                                    color: LightenDarkenColor(colors[2], 200),
                                }}
                                className="no-drag h-[20px] m-1"
                            />
                            {onTop ? (
                                <IconPinFilled
                                    style={{
                                        color: LightenDarkenColor(
                                            colors[2],
                                            200
                                        ),
                                    }}
                                    className="no-drag h-[20px] m-1"
                                    onClick={alwaysOnTop}
                                />
                            ) : (
                                <IconPin
                                    style={{
                                        color: LightenDarkenColor(
                                            colors[2],
                                            200
                                        ),
                                    }}
                                    className="no-drag h-[20px] m-1"
                                    onClick={alwaysOnTop}
                                />
                            )}
                            <CogIcon
                                style={{
                                    color: LightenDarkenColor(colors[2], 200),
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
                                        color: LightenDarkenColor(
                                            colors[2],
                                            200
                                        ),
                                    }}
                                    className="no-drag h-[20px] m-1"
                                    onMouseDown={() => {
                                        setRepeat(!repeat)
                                    }}
                                />
                            ) : (
                                <IconRepeatOff
                                    style={{
                                        color: LightenDarkenColor(
                                            colors[2],
                                            200
                                        ),
                                    }}
                                    className="no-drag h-[20px] m-1"
                                    onMouseDown={() => {
                                        setRepeat(!repeat)
                                    }}
                                />
                            )}
                            <BackwardIcon
                                style={{
                                    color: LightenDarkenColor(colors[2], 200),
                                }}
                                className="no-drag h-[20px] m-1"
                                onClick={() => {
                                    shuffle
                                        ? openFile(
                                              Math.floor(
                                                  Math.random() * files.length
                                              )
                                          )
                                        : openFile(currIdx - 1)
                                }}
                            />
                            {play ? (
                                <PauseIcon
                                    style={{
                                        color: LightenDarkenColor(
                                            colors[2],
                                            200
                                        ),
                                    }}
                                    className="no-drag h-[20px] m-1"
                                    onClick={() => togglePlay()}
                                />
                            ) : (
                                <PlayIcon
                                    style={{
                                        color: LightenDarkenColor(
                                            colors[2],
                                            200
                                        ),
                                    }}
                                    className="no-drag h-[20px] m-1"
                                    onClick={() => togglePlay()}
                                />
                            )}
                            <ForwardIcon
                                style={{
                                    color: LightenDarkenColor(colors[2], 200),
                                }}
                                className="no-drag h-[20px] m-1"
                                onClick={() => {
                                    shuffle
                                        ? openFile(
                                              Math.floor(
                                                  Math.random() * files.length
                                              )
                                          )
                                        : openFile(currIdx + 1)
                                }}
                            />
                            {shuffle ? (
                                <IconArrowsShuffle
                                    style={{
                                        color: LightenDarkenColor(
                                            colors[2],
                                            200
                                        ),
                                    }}
                                    className="no-drag h-[20px] m-1"
                                    onClick={() => setShuffle(false)}
                                />
                            ) : (
                                <IconArrowsRight
                                    style={{
                                        color: LightenDarkenColor(
                                            colors[2],
                                            200
                                        ),
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
                                        color: LightenDarkenColor(
                                            colors[2],
                                            200
                                        ),
                                    }}
                                    className="no-drag h-[20px] m-1"
                                />
                            ) : volume < 0.5 ? (
                                <IconVolume2
                                    style={{
                                        color: LightenDarkenColor(
                                            colors[2],
                                            200
                                        ),
                                    }}
                                    className="no-drag h-[20px] m-1"
                                />
                            ) : (
                                <IconVolume
                                    style={{
                                        color: LightenDarkenColor(
                                            colors[2],
                                            200
                                        ),
                                    }}
                                    className="no-drag h-[20px] m-1"
                                />
                            )}

                            <input
                                style={{
                                    accentColor: LightenDarkenColor(
                                        colors[2],
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
                <div className="bg-[#2a2a2a] min-h-[20px] flex-none place-items-center px-1 drag">
                    <div className="flex flex-row">
                        {directories.map((dir: string, index: number) => {
                            return (
                                <div className="">
                                    <div
                                        key={index}
                                        style={{
                                            backgroundColor:
                                                currDir == dir
                                                    ? '#00000050'
                                                    : '#FFFFFF50',
                                        }}
                                        onClick={() => {
                                            currDir !== dir &&
                                                openCertainDir(dir)
                                        }}
                                        className="inline-block text-white h-[24px] no-drag text-xs ml-1 mt-1 p-1 rounded-md bg-white/20"
                                    >
                                        {directories[index] &&
                                            directories[index]
                                                .split('/')
                                                .reverse()[0]}

                                        <div
                                            className="pl-1 inline-block opacity-30 hover:opacity-100 transition-opacity"
                                            onClick={(e) => removeDir(e, index)}
                                        >
                                            X
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        <FolderPlusIcon
                            style={{
                                color: LightenDarkenColor(colors[2], 200),
                            }}
                            className="no-drag h-[24px] m-1 ml-auto mr-1 hover:animate-pulse transition-opacity"
                            onClick={() => {
                                openDir(false)
                            }}
                        />
                    </div>
                </div>
                <div
                    style={{
                        height: electronWindowHeight - 165,
                    }}
                    className="overflow-y-auto flex-1 flex-grow overflow-x-hidden"
                >
                    {FileList}
                </div>
                <div className="drag bg-[#2a2a2a] min-h-[16px] flex-none place-items-center p-2">
                    <div className="flex flex-row">
                        <p className="text-left text-xs ml-1 min-w-[35%] overflow-hidden inline-block whitespace-nowrap text-white flex-1">
                            {' '}
                            {`${currDir}`}
                        </p>
                        <p className="text-center text-xs mx-1 overflow-hidden inline-block whitespace-nowrap text-white flex-1">
                            {secondsToDhms(
                                durations.reduce(
                                    (acc: number, curr: number) => {
                                        return acc + curr
                                    },
                                    0
                                )
                            )}
                        </p>
                        <div className="mr-1 min-w-[35%] flex-none inline-block ">
                            <p
                                title={currDir}
                                className="text-xs text-right overflow-hidden whitespace-nowrap text-white  text-ellipsis"
                            >
                                {`${currIdx + 1} / ${files.length}`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
