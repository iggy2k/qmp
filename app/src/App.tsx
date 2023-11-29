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
let loadOldSong = -1
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

    const [swapTracks, setSwapTracks] = useState<any[][]>([[], []])

    const [directories, setDirectories] = useState<string[]>([])

    const [swapDirs, setSwapDirs] = useState<string[]>(['', ''])

    const [swapIndeces, setSwapIndeces] = useState<number[]>([-1, -1])

    const [currSong, setCurrSong] = useState<any>({})

    const [play, setPlay] = useState(false)
    const [currTime, setCurrTime] = useState(0)
    const [mouseDown, setMouseDown] = useState(false)
    const [progress, setProgress] = useState(0)
    const [volume, setVolume] = useState(0.5)
    const [preMuteVolume, setPreMuteVolume] = useState(0.5)
    const [shuffle, setShuffle] = useState(false)
    const [onTop, setOnTop] = useState(false)
    const [resized, setResized] = useState(false)
    const [repeat, setRepeat] = useState(false)

    const [sessionRestored, setSessionRestored] = useState(false)
    const [lastFile, setLastFile] = useState('')
    const [lastIndex, setLastIndex] = useState(-1)

    const [closedBothSwapDirs, setClosedBothSwapDirs] = useState(false)

    const Row = ({ index, style }: any) => (
        <div
            style={style}
            key={index}
            className={`overflow-auto h-7 px-2 ${index == 0 ? 'pt-1' : ''} ${
                index == swapTracks[0].length - 1 ? 'pb-1' : ''
            }`}
        >
            <div
                style={{
                    backgroundColor:
                        index == swapIndeces[1] && swapDirs[0] == swapDirs[1]
                            ? '#888888' + '20'
                            : '',
                }}
                className="hover:bg-black/20 transition-opacity duration-300 flex flex-row p-[1px] text-center rounded-md"
                onClick={() => {
                    openFile(swapTracks[0][index].file, true, index)
                }}
            >
                {swapTracks[0][index] && swapTracks[0][index].cover ? (
                    <img
                        className="w-[24px] h-[24px] rounded-lg flex-none"
                        src={swapTracks[0][index].cover}
                        alt=""
                    />
                ) : (
                    <IconMusic className="drag min-w-[24px] min-h-[24px] max-w-[24px] max-h-[24px] text-white" />
                )}

                <div className="text-sm place-items-center ml-2 whitespace-nowrap overflow-hidden text-ellipsis text-white/70">
                    {swapTracks[0][index] && swapTracks[0][index].name ? (
                        <div className="flex flex-row">
                            <p className="text-white/80">
                                {swapTracks[0][index].name &&
                                    swapTracks[0][index].name.replace('\\', '')}
                            </p>
                            <p className="ml-1 text-white/50">
                                {swapTracks[0][index].author &&
                                    swapTracks[0][index].author.replace(
                                        '\\',
                                        ''
                                    )}
                            </p>
                            <p className="ml-1 text-white/30">
                                {swapTracks[0][index].album &&
                                    swapTracks[0][index].album.replace(
                                        '\\',
                                        ''
                                    )}
                            </p>
                        </div>
                    ) : (
                        <p>
                            {' '}
                            {swapTracks[0][index] &&
                                swapTracks[0][index].file
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
                            {swapTracks[0][index] &&
                                secondsToDhmsShort(
                                    swapTracks[0][index].duration
                                ).replace(' : ', ':')}
                            &nbsp;|&nbsp;
                            {swapTracks[0][index]
                                ? swapTracks[0][index].format
                                : '🎵'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const setAudioSource = (filePath: string) => {
        if (filePath) {
            audio.src = `file://${filePath}`
        } else {
            audio.src = ''
        }
    }

    // Switch to a new track
    const openFile = (file: string, setSameDir: boolean, index: number) => {
        console.log(
            `openFile(file: ${file}, setSameDir: ${setSameDir}), index: ${index}`
        )
        if (swapDirs[0] == swapDirs[1]) {
            setCurrSong(swapTracks[0][index])
            setAudioSource(file)
        } else {
            if (setSameDir) {
                setSwapTracks((swapTracks) => [swapTracks[0], swapTracks[0]])
                setSwapDirs((swapDirs) => [swapDirs[0], swapDirs[0]])
                setCurrSong(swapTracks[0][index])
                setAudioSource(file)
            } else {
                setCurrSong(swapTracks[1][index])
                setAudioSource(file)
            }
        }

        setProgress(0)
        setCurrTime(0)
        setSwapIndeces((swapIndeces) => [swapIndeces[0], index])

        window.Main.setLastOpenDir(swapDirs[0])
        window.Main.setOldFile(file)
        window.Main.setOldIndex(index)
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

    // Update the fancy progressbar
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

    // Update the colors for the dynamic gradient of the current track
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

    // Hmm... What can this be?
    const mute = () => {
        setPreMuteVolume(volume)
        setVolume(0)
    }

    // Remove a certain directory
    const removeDir = (e: any, idx: number) => {
        e.stopPropagation()
        // Last directory case
        if (directories.length == 1) {
            setSwapTracks([[], []])
            setColors(['#000000', '#000000', '#000000', '#000000'])
            window.Main.setLastOpenDir('')
        } else {
            // Directory that is both open and playing
            if (directories[idx] == swapDirs[0] && swapDirs[0] == swapDirs[1]) {
                let idx = directories.indexOf(swapDirs[1])
                openCertainDir(
                    directories[idx + 1] || directories[idx - 1],
                    false
                )
                setClosedBothSwapDirs(true)
                // Directory that is currently open
            } else if (directories[idx] == swapDirs[0]) {
                openCertainDir(
                    directories[idx - 1] || directories[idx + 1],
                    false
                )
                // Directory that is currently playing
            } else if (directories[idx] == swapDirs[1]) {
                openCertainDir(swapDirs[0], false)
                openFile(swapTracks[0][0].file, true, 0)
            }
        }
        // Update directory for session restore
        window.Main.RemoveDir(directories[idx])
        setDirectories(directories.filter((dir) => dir !== directories[idx]))
    }

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

    // Open a directory via dialog window
    const openCertainDir = (path: string, changeIndex: boolean) => {
        window.Main.send('open-dir-tm', [path, changeIndex])
    }

    // Load all supported audio files from
    // a directory (recursive)
    const addDir = () => {
        window.Main.send('add-dir-tm', null)
    }

    // Set track metadata and covers once the directory is loaded
    const unpackFilesData = (filesData: any[], filesPaths: string[]) => {
        let formats = filesData[0].map(
            (trackData: { [x: string]: { [x: string]: any } }) =>
                trackData['format']['container']
                    ? trackData['format']['container']
                    : null
        )

        let durations = filesData[0].map(
            (trackData: { [x: string]: { [x: string]: any } }) =>
                trackData['format']['duration']
                    ? trackData['format']['duration']
                    : null
        )

        let rates = filesData[0].map(
            (trackData: { [x: string]: { [x: string]: any } }) =>
                trackData['format']['sampleRate']
                    ? trackData['format']['sampleRate']
                    : null
        )

        let names = filesData[0].map(
            (trackData: { [x: string]: { [x: string]: any } }) =>
                trackData['common']['title']
                    ? trackData['common']['title']
                    : null
        )

        let albums = filesData[0].map(
            (trackData: { [x: string]: { [x: string]: any } }) =>
                trackData['common']['album']
                    ? trackData['common']['album']
                    : null
        )

        let authors = filesData[0].map(
            (trackData: { [x: string]: { [x: string]: any } }) =>
                trackData['common']['artist']
                    ? trackData['common']['artist']
                    : null
        )

        let covers = filesData[1]
        let newSongs: {
            format: string
            duration: string
            rate: string
            name: string
            album: string
            author: string
            cover: string
            file: string
        }[] = []
        for (let i = 0; i < names.length; i++) {
            newSongs.push({
                format: formats[i],
                duration: durations[i],
                rate: rates[i],
                name: names[i],
                album: albums[i],
                author: authors[i],
                cover: covers[i],
                file: filesPaths[i],
            })
        }
        return newSongs
    }

    // Change track time
    const setSeek = (time: number) => {
        if (audio) {
            audio.currentTime = time
        }
    }

    // Save current track cover art if it exists
    const downloadCover = (b64data: any) => {
        if (b64data !== undefined && currSong) {
            window.Main.SaveCover(b64data.toString('base64'), currSong.name)
        }
    }

    // Open settings in a new window
    const openSettings = () => {
        window.Main.send('open-settings-tm', null)
    }

    // Currently open directory track list
    const FileList = useMemo(
        () => (
            <List
                ref={listRef}
                className={`list scroll-smooth`}
                height={electronWindowHeight - 165}
                itemCount={swapTracks[0] ? swapTracks[0].length : 0}
                itemSize={30}
                width={'100%'}
            >
                {Row}
            </List>
        ),
        [swapTracks, swapIndeces, electronWindowHeight, swapDirs]
    )

    // Restore old dir and song after restore-session-fm is received
    useEffect(() => {
        if (
            !sessionRestored &&
            swapTracks[0][lastIndex] &&
            lastFile !== '' &&
            lastIndex !== -1
        ) {
            setSessionRestored(true)
            openFile(lastFile, true, lastIndex)
        }
    }, [sessionRestored, swapTracks, lastFile, lastIndex])

    // Add a new directory after add-dir-tm receiver fires
    useEffect(() => {
        !directories.includes(swapDirs[0]) &&
            swapDirs[0] &&
            setDirectories([...directories, swapDirs[0]])
    }, [swapDirs])

    // Audio update
    useEffect(() => {
        audio.loop = repeat
        audio.volume = volume
    }, [repeat, volume])

    // Open a file of a different directory
    // in case a directory that is both open and playing was closed
    useEffect(() => {
        if (swapTracks[0][0] && closedBothSwapDirs) {
            openFile(swapTracks[0][0].file, true, 0)
            setClosedBothSwapDirs(false)
        }
    }, [swapTracks])

    useEffect(() => {
        console.log(`swapIndeces = ${swapIndeces}`)
        if (listRef.current && !resized && swapDirs[0] == swapDirs[1]) {
            listRef.current.scrollToItem(swapIndeces[1], 'smart')
        }
        if (audio.paused && play) {
            audio.play()
        } else if (audio.paused && !play) {
            audio.pause()
            setPlay(false)
        }
    }, [swapIndeces])

    // Normal way of using react with listeners
    useEffect(() => {
        audio.ontimeupdate = updateProgress
        window.Main.send('restore-session-tm', null)
        window.Main.receive(
            'restore-session-fm',
            (
                last_open_dir: string,
                last_file: string,
                past_dirs: string[],
                last_index: number
            ) => {
                console.log(
                    `restore-session-fm * ${last_open_dir} \n ${last_file} \n ${past_dirs} * `
                )
                past_dirs && setDirectories(past_dirs)
                last_open_dir && openCertainDir(last_open_dir, true)
                last_file && setLastFile(last_file)
                last_index && setLastIndex(last_index)
                // last_file && openFile(last_file, true, last_index)
            }
        )
        window.Main.receive('get-height-from-main', (height: number) => {
            setElectronWindowHeight(height)
        })

        window.Main.receive(
            'add-dir-tm',
            (new_dir: string, filesData: any[], filesPaths: string[]) => {
                setSwapDirs((swapDirs) => [new_dir, swapDirs[1]])

                let newSongs = unpackFilesData(filesData, filesPaths)

                setSwapTracks((swapTracks) => [newSongs, swapTracks[1]])
            }
        )

        window.Main.receive(
            'open-dir-fm',
            (
                new_dir: string,
                filesData: any[],
                filesPaths: string[],
                changeIndex: boolean
            ) => {
                console.log(`open-dir-fm(
                    ${new_dir}
                    \${filesData}
                    ${filesPaths}
                    ${changeIndex})`)
                setSwapDirs((swapDirs) => [new_dir, swapDirs[1]])

                let newSongs = unpackFilesData(filesData, filesPaths)

                setSwapTracks((swapTracks) => [newSongs, swapTracks[1]])

                if (changeIndex) {
                    console.log('change swapIndeces[0] to 0')
                    setSwapIndeces((swapIndeces) => [0, swapIndeces[1]])
                } else {
                    console.log('no change in swapIndeces[0]')
                    setSwapTracks((swapTracks) => [newSongs, swapTracks[1]])
                }
            }
        )

        return () => {
            audio.pause()
        }
    }, [])

    useEffect(() => {
        updateColors()
        currSong &&
            console.log(
                'updateColors for ' +
                    (currSong.name ? currSong.name : currSong.file)
            )
    }, [currSong])

    useEffect(() => {
        if (progress === 800 && !repeat) {
            if (shuffle) {
                let rand_idx = Math.floor(Math.random() * swapTracks[1].length)
                openFile(swapTracks[1][rand_idx].file, false, rand_idx)
            } else {
                openFile(
                    swapTracks[1][(swapIndeces[1] + 1) % swapTracks[1].length]
                        .file,
                    false,
                    (swapIndeces[1] + 1) % swapTracks[1].length
                )
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
                                {currSong && currSong.cover ? (
                                    <img
                                        ref={trackCoverRef}
                                        className="no-drag ml-[0.1rem] rounded-lg duration-150 hover:scale-110 hover:shadow-[0_10px_20px_rgba(0,_0,_0,_0.7)] transition-[
                                transition-property: transform, shadow, opacity;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 150ms;] 
                                "
                                        src={currSong ? currSong.cover : ''}
                                        onClick={() => {
                                            currSong
                                                ? downloadCover(currSong.cover)
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
                                        className="drag ml-[0.15rem] w-[64px] h-[64px] rounded-[10px]"
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
                                {currSong &&
                                    currSong.file &&
                                    currSong.file
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
                                    {currSong
                                        ? currSong.name
                                            ? currSong.name
                                                  .split('/')
                                                  .reverse()[0]
                                                  .replace(/\.[^/.]+$/, '')
                                            : currSong.file
                                            ? currSong.file
                                                  .split('/')
                                                  .reverse()[0]
                                                  .replace(/\.[^/.]+$/, '')
                                            : ''
                                        : ''}
                                </p>
                                <p>
                                    &nbsp;{!currSong || '-'}
                                    &nbsp;
                                </p>
                                <p>{currSong && currSong.album}</p>
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
                                    {currSong &&
                                        secondsToDhmsShort(currSong.duration)}
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
                                            150
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
                                            150
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
                                    let rand_idx = Math.floor(
                                        Math.random() * swapTracks[1].length
                                    )
                                    shuffle
                                        ? openFile(
                                              swapTracks[1][rand_idx].file,
                                              false,
                                              rand_idx
                                          )
                                        : openFile(
                                              swapTracks[1][
                                                  swapIndeces[1] >= 1
                                                      ? swapIndeces[1] - 1
                                                      : swapTracks[1].length - 1
                                              ].file,
                                              false,
                                              swapIndeces[1] >= 1
                                                  ? swapIndeces[1] - 1
                                                  : swapTracks[1].length - 1
                                          )
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
                                    let rand_idx = Math.floor(
                                        Math.random() * swapTracks[1].length
                                    )
                                    shuffle
                                        ? openFile(
                                              swapTracks[1][rand_idx].file,
                                              false,
                                              rand_idx
                                          )
                                        : openFile(
                                              swapTracks[1][
                                                  (swapIndeces[1] + 1) %
                                                      swapTracks[1].length
                                              ].file,
                                              false,
                                              (swapIndeces[1] + 1) %
                                                  swapTracks[1].length
                                          )
                                }}
                            />
                            {shuffle ? (
                                <IconArrowsShuffle
                                    style={{
                                        color: LightenDarkenColor(
                                            colors[2],
                                            150
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
                                    onClick={() => {
                                        setVolume(preMuteVolume)
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
                                    onClick={() => {
                                        mute()
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
                                    onClick={() => {
                                        mute()
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
                                                swapDirs[0] == dir
                                                    ? '#ffa640'
                                                    : '#333333',
                                            color:
                                                swapDirs[0] == dir
                                                    ? '#333333'
                                                    : '#ffa640',
                                            borderBottom:
                                                swapDirs[1] == dir
                                                    ? '1px solid #ffa640'
                                                    : '',
                                        }}
                                        onClick={() => {
                                            swapDirs[0] !== dir &&
                                                openCertainDir(dir, true)
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
                            className={`no-drag h-[24px] m-1 ml-auto mr-1 ${
                                directories.length == 0
                                    ? 'animate-pulse transition-opacity'
                                    : ''
                            }`}
                            onClick={() => {
                                addDir()
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
                        <p className="text-left text-xs ml-1 min-w-[35%] .rtl-grid overflow-hidden inline-block whitespace-nowrap text-white flex-1">
                            {' '}
                            {swapDirs[0] || 'No directory loaded'}
                        </p>
                        <p className="text-center text-xs mx-1 overflow-hidden inline-block whitespace-nowrap text-white flex-1">
                            {swapTracks[0].length > 0
                                ? secondsToDhms(
                                      swapTracks[0]
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
                                : '0d 0h 0m 0s'}
                        </p>
                        <div className="mr-1 min-w-[35%] flex-none inline-block ">
                            <p
                                title={swapDirs[0]}
                                className="text-xs text-right overflow-hidden whitespace-nowrap text-white  text-ellipsis"
                            >
                                {swapTracks[0].length > 0
                                    ? `${swapIndeces[0] + 1} / ${
                                          swapTracks[0].length
                                      }`
                                    : '0 / 0'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
