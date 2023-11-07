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

    const [songs, setSongs] = useState<any[]>([])
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
                index == songs.length - 1 ? 'pb-1' : ''
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
                {songs[index] && songs[index].cover ? (
                    <img
                        className="w-[24px] h-[24px] rounded-lg flex-none"
                        src={songs[index].cover}
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
                    {songs[index] && songs[index].name ? (
                        <div className="flex flex-row">
                            <p className="text-white/80">
                                {songs[index].name &&
                                    songs[index].name.replace('\\', '')}
                            </p>
                            <p className="ml-1 text-white/50">
                                {songs[index].author &&
                                    songs[index].author.replace('\\', '')}
                            </p>
                            <p className="ml-1 text-white/30">
                                {songs[index].album &&
                                    songs[index].album.replace('\\', '')}
                            </p>
                        </div>
                    ) : (
                        <p>
                            {' '}
                            {songs[index] &&
                                songs[index].file
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
                        className="p-[0.1rem] grid grid-flow-col text-xs font-mono rounded-md"
                    >
                        <div className="rounded-md px-1 font-mono bg-[#222222] text-[#ffa640]">
                            {songs[index] &&
                                secondsToDhmsShort(
                                    songs[index].duration
                                ).replace(' : ', ':')}
                            &nbsp;|&nbsp;
                            {songs[index] ? songs[index].format : '🎵'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    // Switch to a new track
    const openFile = (index: number) => {
        if (index < 0) {
            index = songs.length - 1
        } else if (index > songs.length - 1) {
            index = 0
        }
        setProgress(0)
        setCurrTime(0)
        setCurrIdx(index)
        window.Main.send('set-old-idx', index)
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

                setColors([
                    keys[0] || '#333333',
                    keys[6] || '#333333',
                    keys[12] || '#333333',
                    keys[18] || '#333333',
                ])
            })
    }

    const removeDir = (e: any, idx: number) => {
        e.stopPropagation()
        if (directories.length == 1) {
            setSongs([])
            setColors(['#000000', '#000000', '#000000', '#000000'])
        }
        window.Main.RemoveDir(directories[idx])
        setDirectories(directories.filter((dir) => dir !== directories[idx]))
        window.Main.RemoveLastOpenDir()
        setFileListFlick(fileListFlick + 1)
        setCurrDir(directories[idx - 1] || '')
    }

    useEffect(() => {
        console.log('directories = ' + directories)
    }, [directories])

    useEffect(() => {
        console.log('currDir = ' + currDir)
    }, [currDir])

    // Get seek time from mouse position on the track
    const relativeCoords = (e: any, click: boolean) => {
        if (!audio) {
            return
        }
        e.stopPropagation()
        let elem = document.getElementById('track')
        var bounds = elem!.getBoundingClientRect()
        var x = e.clientX - bounds.left
        var relative_pos = (audio.duration / 150) * x
        if (
            (mouseDown || click) &&
            !Number.isNaN(relative_pos) &&
            relative_pos !== Infinity
        ) {
            setSeek(relative_pos)
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
            window.Main.SaveCover(
                b64data.toString('base64'),
                songs[currIdx].name
            )
        }
    }

    const openSettings = () => {
        window.Main.send('open-settings-tm', null)
    }

    const FileList = useMemo(
        () => (
            <List
                ref={listRef}
                className={`list ${fileListFlick} scroll-smooth`}
                height={electronWindowHeight - 165}
                itemCount={songs.length}
                itemSize={30}
                width={'100%'}
            >
                {Row}
            </List>
        ),
        [songs, fileListFlick, currIdx, electronWindowHeight]
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
        if (songs[currIdx]) {
            audio.src = songs[currIdx].file
                ? `file://${songs[currIdx].file}`
                : ''
        }

        updateColors()
        if (play) {
            togglePlay()
        }
    }, [currIdx, fileListFlick])

    // Normal way of using react with listeners
    useEffect(() => {
        audio.ontimeupdate = updateProgress
        window.Main.receive('get-old-idx-fm', (index: number) => {
            setCurrIdx(index)
        })
        window.Main.receive('get-old-dirs-from-main', (dirs: string[]) => {
            console.log('dirs ' + dirs)
            setDirectories(dirs)
            openCertainDir(dirs[0])
        })
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
        let files = []
        window.Main.receive('get-files-from-main', (data: any) => {
            if (data.length > 0) {
                files = data
                const paths = Object.values(data)
                window.Main.send('toMain', paths)
            }
        })
        window.Main.receive('fromMain', (data2: any, files: any) => {
            if (data2[1].length > 1) {
                // Case: get all tracks in the directory
                let formats = data2[0].map(
                    (trackData: { [x: string]: { [x: string]: any } }) =>
                        trackData['format']['container']
                            ? trackData['format']['container']
                            : null
                )

                let durations = data2[0].map(
                    (trackData: { [x: string]: { [x: string]: any } }) =>
                        trackData['format']['duration']
                            ? trackData['format']['duration']
                            : null
                )

                let rates = data2[0].map(
                    (trackData: { [x: string]: { [x: string]: any } }) =>
                        trackData['format']['sampleRate']
                            ? trackData['format']['sampleRate']
                            : null
                )

                let names = data2[0].map(
                    (trackData: { [x: string]: { [x: string]: any } }) =>
                        trackData['common']['title']
                            ? trackData['common']['title']
                            : null
                )

                let albums = data2[0].map(
                    (trackData: { [x: string]: { [x: string]: any } }) =>
                        trackData['common']['album']
                            ? trackData['common']['album']
                            : null
                )

                let authors = data2[0].map(
                    (trackData: { [x: string]: { [x: string]: any } }) =>
                        trackData['common']['artist']
                            ? trackData['common']['artist']
                            : null
                )

                let covers = data2[1]

                let newSongs = []
                for (let i = 0; i < names.length; i++) {
                    newSongs.push({
                        format: formats[i],
                        duration: durations[i],
                        rate: rates[i],
                        name: names[i],
                        album: albums[i],
                        author: authors[i],
                        cover: covers[i],
                        file: files[i],
                    })
                }
                setSongs(newSongs)
                window.Main.send('get-old-idx-tm', null)
                setFileListFlick(fileListFlick + 1)
            }
        })

        window.Main.GetOldDirs()

        return () => {
            audio.pause()
        }
    }, [])

    useEffect(() => {
        console.log('songs ' + songs.length)
        songs[0] && console.log('songs ' + Object.entries(songs[0].name))
    }, [currIdx])

    useEffect(() => {
        if (progress === 800 && !repeat) {
            if (shuffle) {
                openFile(Math.floor(Math.random() * songs.length))
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
                            radial-gradient(ellipse at top left, ${colors[0]}50  50%, transparent 80%),
                            radial-gradient(ellipse at bottom  left, ${colors[1]}50  50% , transparent 80%),
                            radial-gradient(ellipse at top    right, ${colors[2]}50 50% , transparent 80%),
                            radial-gradient(ellipse at bottom right, ${colors[3]}50  50% , transparent 80%)`,
                    }}
                    className={`bg-[#333333] drag ${
                        play ? 'animate-spin' : 'animate-spin pause'
                    }`}
                >
                    <div className="flex">
                        <div className="no-drag p-2 pl-2 pb-0">
                            <div className="flex-none w-[64px] h-[64px]">
                                {songs[currIdx] && songs[currIdx].cover ? (
                                    <img
                                        ref={trackCoverRef}
                                        className="no-drag rounded-lg duration-150 hover:scale-110 hover:shadow-[0_10px_20px_rgba(0,_0,_0,_0.7)] transition-[
                                transition-property: transform, shadow, opacity;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 150ms;] 
                                "
                                        src={
                                            songs[currIdx]
                                                ? songs[currIdx].cover
                                                : ''
                                        }
                                        onClick={() => {
                                            songs[currIdx]
                                                ? downloadCover(
                                                      songs[currIdx].cover
                                                  )
                                                : null
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
                                {songs[currIdx] &&
                                    songs[currIdx].file
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
                                    {songs[currIdx] &&
                                        songs[currIdx].file
                                            .split('/')
                                            .reverse()[0]
                                            .replace(/\.[^/.]+$/, '')}
                                </p>
                                <p>
                                    &nbsp;{!songs[currIdx] || '-'}
                                    &nbsp;
                                </p>
                                <p>{songs[currIdx] && songs[currIdx].album}</p>
                            </div>
                            <div className="w-full h-[20px] flex flex-row">
                                <div
                                    className="no-drag w-[150px] flex-initial"
                                    id="track"
                                    // This id value needed as using e.target can target the child
                                    // latter being the track knob which has its own bounds.
                                    // This causes unexpected bahaviour
                                    onMouseMove={(e) => {
                                        relativeCoords(e, false)
                                    }}
                                    onClick={(e) => {
                                        relativeCoords(e, true)
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
                                    {songs[currIdx] &&
                                        secondsToDhmsShort(
                                            songs[currIdx].duration
                                        )}
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
                                                  Math.random() * songs.length
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
                                                  Math.random() * songs.length
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
                                <div key={index}>
                                    <div
                                        style={{
                                            backgroundColor:
                                                currDir == dir
                                                    ? '#ffa640'
                                                    : '#333333',
                                            color:
                                                currDir == dir
                                                    ? '#333333'
                                                    : '#ffa640',
                                        }}
                                        onClick={() => {
                                            currDir !== dir &&
                                                openCertainDir(dir)
                                        }}
                                        className="inline-block text-white h-[24px] no-drag text-xs ml-1 mt-1 p-1 rounded-xl"
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
                        <p
                            title={currDir}
                            className="text-left text-xs rtl-grid ml-1 min-w-[35%] overflow-hidden inline-block whitespace-nowrap text-white flex-1 no-drag duration-1000 transition-colors hover:text-[#ee8383] "
                        >
                            {' '}
                            {currDir || 'Current Directory: None'}
                        </p>
                        <p className="text-center text-xs mx-1 overflow-hidden inline-block whitespace-nowrap text-white flex-1">
                            {songs.length > 0
                                ? secondsToDhms(
                                      songs
                                          .map(function (song) {
                                              return song.duration
                                          })
                                          .reduce(
                                              (acc: number, curr: number) => {
                                                  return acc + curr
                                              },
                                              0
                                          )
                                  )
                                : 'Total Song Duration'}
                        </p>
                        <div className="mr-1 min-w-[35%] flex-none inline-block ">
                            <p
                                title={currDir}
                                className="text-xs text-right overflow-hidden whitespace-nowrap text-white  text-ellipsis"
                            >
                                {songs.length > 0
                                    ? `${currIdx + 1} / ${songs.length}`
                                    : 'Current song #'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
