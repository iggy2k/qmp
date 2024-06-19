import React, { useEffect, useState, useRef } from 'react'
import { prominent } from 'color.js'
import { PlusIcon, UploadIcon, CardStackPlusIcon } from '@radix-ui/react-icons'

import { Button } from '../components/primitives/button'

import { cn } from '../lib/utils'

import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

import { grayness, rgbToHex } from './helpers'

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { SortableItem } from '../components/complex/SortableItem'
import { BottomBar } from '../components/complex/BottomBar'
import { ControlsBar } from '../components/complex/ControlsBar'
import { DirectoryBadge } from '../components/complex/DirectoryBadge'
import { FixedSizeList } from 'react-window'
import { CloseOrCollapse } from '../components/complex/CloseOrCollapse'
import { TrackArea } from '../components/complex/TrackArea'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../components/primitives/dropdown-menu'

const PROGRESS_BAR_PRECISION = 1000

const audio = new Audio() as HTMLAudioElement & {
    setSinkId(deviceId: string): void
    sinkId: string
}

const audioContext = new AudioContext()
let analyser = audioContext.createAnalyser()
analyser.minDecibels = -90
analyser.maxDecibels = -10
analyser.smoothingTimeConstant = 1.0 //0.75;
analyser.fftSize = 128
let sourceNode = audioContext.createMediaElementSource(audio)
let gainNode = audioContext.createGain()

let filters: BiquadFilterNode[] = []

let freqs = [32, 64, 125, 500, 1000, 2000, 4000, 8000, 16000]

for (let i = 0; i < freqs.length; i++) {
    let freq = freqs[i]
    let filter = audioContext.createBiquadFilter()
    if (i === 0) {
        filter.type = 'lowshelf'
    } else if (i === freqs.length - 1) {
        filter.type = 'highshelf'
    } else {
        filter.type = 'peaking'
        filter.Q.value = 1
    }
    filter.frequency.value = freq
    filter.gain.value = 0
    filters.push(filter)
}

console.log(filters)

// sourceNode.connect(gainNode)

for (let i = 0; i <= filters.length; i++) {
    if (i === 0) {
        sourceNode.connect(filters[i])
    } else if (i === filters.length) {
        filters[i - 1].connect(analyser)
    } else {
        filters[i - 1].connect(filters[i])
    }
}

analyser.connect(gainNode)
gainNode.connect(audioContext.destination)

async function setAudioOutput(deviceId: string) {
    await audio.setSinkId(deviceId)
    window.Main.send('get-audio-output-tm', audio.sinkId)
}

interface TrackCouple {
    viewing: any[]
    playing: any[]
}
interface PlaylistCouple {
    viewing: string
    playing: string
}

interface IndexCouple {
    viewing: number
    playing: number
}

function App() {
    const [activeId, setActiveId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            // Alternative. Works worse than distance prop in practice
            // activationConstraint: { delay: 100, tolerance: 0 },
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    function handleDragEnd(event: any) {
        const { active, over }: any = event
        if (active.id !== over.id) {
            setActiveTracks((activeTracks) => {
                const oldIndex = activeTracks.viewing
                    .map((track) => {
                        return track.file
                    })
                    .indexOf(active.id)
                const newIndex = activeTracks.viewing
                    .map((track) => {
                        return track.file
                    })
                    .indexOf(over.id)
                let newTracks = {
                    viewing: arrayMove(
                        activeTracks.viewing,
                        oldIndex,
                        newIndex
                    ),
                    playing: activeTracks.playing,
                }
                window.Main.send('reorder-playlist', {
                    new_playlist: newTracks.viewing.map((e: any) => e.file),
                    playlist_name: activePlaylists.viewing,
                })
                return newTracks
            })
            if (activePlaylists.viewing == activePlaylists.playing) {
                const newIndex = activeTracks.viewing
                    .map((track) => {
                        return track.file
                    })
                    .indexOf(over.id)
                console.log(newIndex)
                setPlaylistIndices((playlistIndices) => ({
                    viewing: playlistIndices.viewing,
                    playing: newIndex,
                }))
            }
        }
        setActiveId(null)
    }

    const [colors, setColors] = useState([
        '#000000',
        '#000000',
        '#000000',
        '#000000',
    ])

    const [UIColors, setUIColors] = useState<{
        background: string
        accent: string
        text: string
        altText: string
    }>({
        background: '#000000',
        accent: '#000000',
        text: '#000000',
        altText: '#000000',
    })

    const [settings, setSettings] = useState<{
        useCover: boolean
        movingColors: boolean
        downloadCover: boolean
        transparentInactive: boolean
        bottomBar: boolean
        framelessWindow: boolean
    }>({
        useCover: false,
        movingColors: false,
        downloadCover: false,
        transparentInactive: false,
        bottomBar: false,
        framelessWindow: false,
    })

    // Current track data states
    const listRef = useRef<null | any>(null)
    const trackCoverRef = useRef<null | HTMLImageElement>(null)
    const [electronWindowHeight, setElectronWindowHeight] = useState(450)

    const [activeTracks, setActiveTracks] = useState<TrackCouple>({
        viewing: [],
        playing: [],
    })

    const [allPlaylists, setAllPlaylists] = useState<string[]>([])

    const [activePlaylists, setActivePlaylists] = useState<PlaylistCouple>({
        viewing: '',
        playing: '',
    })

    const [playlistIndices, setPlaylistIndices] = useState<IndexCouple>({
        playing: -1,
        viewing: -1,
    })

    const [currentSong, setCurrentSong] = useState<any>({})
    const [play, setPlay] = useState(false)
    const [progress, setProgress] = useState(0)
    const [volume, setVolume] = useState(0.1)
    const [preMuteVolume, setPreMuteVolume] = useState(0.1)
    const [shuffle, setShuffle] = useState(false)
    const [onTop, setOnTop] = useState(false)
    const [resized, setResized] = useState(false)
    const [repeat, setRepeat] = useState(false)
    const [sessionRestored, setSessionRestored] = useState(false)
    const [lastFile, setLastFile] = useState('')
    const [lastIndex, setLastIndex] = useState(-1)
    const [closedBothPlaylists, setClosedBothPlaylists] = useState(false)

    const [filterGains, setFilterGains] = useState<number[]>([
        ...filters.map((_) => {
            return 0
        }),
    ])

    const [preampGain, setPreampGain] = useState(0.5)

    const setAudioSource = (filePath: string) => {
        if (filePath) {
            audio.src = `file://${filePath}`
        } else {
            audio.src = ''
        }
    }

    const sendOldColors = () => {
        window.Main.send('set-old-ui-colors-tm', UIColors)
    }

    // Switch to a new track
    const openFile = (file: string, setSameDir: boolean, index: number) => {
        console.log('openFile', file, setSameDir, index)
        if (activePlaylists.playing == activePlaylists.viewing) {
            setCurrentSong(activeTracks.viewing[index])
            setAudioSource(file)
        } else {
            if (setSameDir) {
                console.log('openFile', activeTracks)
                setActiveTracks((activeTracks) => ({
                    viewing: activeTracks.viewing,
                    playing: activeTracks.viewing,
                }))
                setActivePlaylists((activePlaylists) => ({
                    viewing: activePlaylists.viewing,
                    playing: activePlaylists.viewing,
                }))
                setCurrentSong(activeTracks.viewing[index])
                setAudioSource(file)
            } else {
                setCurrentSong(activeTracks.playing[index])
                setAudioSource(file)
            }
        }

        setProgress(0)

        setPlaylistIndices((playlistIndices) => ({
            viewing: playlistIndices.viewing,
            playing: index,
        }))

        window.Main.setLastOpenDir(activePlaylists.viewing)
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
                let new_progress = Math.trunc(frac * PROGRESS_BAR_PRECISION)
                setProgress(new_progress)
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

    const mute = () => {
        setPreMuteVolume(volume)
        setVolume(0)
    }

    // Remove a certain directory
    const removeDir = (e: any, idx: number) => {
        e.stopPropagation()
        // Last directory case
        if (allPlaylists.length == 1) {
            setActiveTracks({ viewing: [], playing: [] })
            setColors(['#000000', '#000000', '#000000', '#000000'])
            window.Main.setLastOpenDir('')
            setCurrentSong({})
            setAudioSource('')
        } else {
            // Directory that is both open and playing
            if (
                allPlaylists[idx] == activePlaylists.viewing &&
                activePlaylists.viewing == activePlaylists.playing
            ) {
                let idx = allPlaylists.indexOf(activePlaylists.playing)
                openCertainDir(
                    allPlaylists[idx + 1] || allPlaylists[idx - 1],
                    false
                )
                setClosedBothPlaylists(true)
                // Directory that is currently open
            } else if (allPlaylists[idx] == activePlaylists.viewing) {
                openCertainDir(
                    allPlaylists[idx - 1] || allPlaylists[idx + 1],
                    false
                )
                // Directory that is currently playing
            } else if (allPlaylists[idx] == activePlaylists.playing) {
                openCertainDir(activePlaylists.viewing, false)
                openFile(activeTracks.viewing[0].file, true, 0)
            }
        }
        // Update directory for session restore
        window.Main.RemoveDir(allPlaylists[idx])
        setAllPlaylists(allPlaylists.filter((dir) => dir !== allPlaylists[idx]))
    }

    // Open a directory via dialog window
    const openCertainDir = (path: string, setIndexToZero: boolean) => {
        window.Main.send('open-dir-tm', [path, setIndexToZero])
    }

    // Load all supported audio files from
    // a directory (recursive)
    const addDir = () => {
        window.Main.send('add-dir-tm', null)
    }

    const addPlaylist = () => {
        window.Main.send('add-playlist-tm', null)
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
        if (b64data !== undefined && currentSong) {
            window.Main.SaveCover(b64data.toString('base64'), currentSong.name)
        }
    }

    // Open settings in a new window
    const openSettings = () => {
        window.Main.send('open-settings-tm', null)
    }

    // Restore old dir and song after restore-session-fm is received
    useEffect(() => {
        if (
            !sessionRestored &&
            activeTracks.viewing[lastIndex] &&
            lastFile !== '' &&
            lastIndex !== -1
        ) {
            setSessionRestored(true)
            openFile(lastFile, true, lastIndex)
        }
    }, [sessionRestored, activeTracks, lastFile, lastIndex])

    // Add a new directory after add-dir-tm receiver fires
    useEffect(() => {
        !allPlaylists.includes(activePlaylists.viewing) &&
            activePlaylists.viewing &&
            setAllPlaylists([...allPlaylists, activePlaylists.viewing])
    }, [activePlaylists])

    // Audio update
    useEffect(() => {
        audio.loop = repeat
        audio.volume = volume
    }, [repeat, volume])

    // Open a file of a different directory
    // in case a directory that is both open and playing was closed
    useEffect(() => {
        if (activeTracks.viewing[0] && closedBothPlaylists) {
            openFile(activeTracks.viewing[0].file, true, 0)
            setClosedBothPlaylists(false)
        }
    }, [activeTracks])

    // Handle change of index in the playing directory
    useEffect(() => {
        if (
            listRef.current &&
            !resized &&
            activePlaylists.viewing == activePlaylists.playing
        ) {
            listRef.current.scrollToItem(playlistIndices.playing, 'smart')
        }
        if (audio.paused && play) {
            audio.play()
        } else if (audio.paused && !play) {
            audio.pause()
            setPlay(false)
        }
    }, [playlistIndices])

    // Normal way of using react with listeners
    useEffect(() => {
        audio.ontimeupdate = updateProgress

        window.Main.send('restore-session-tm', null)
        window.Main.send('get-old-ui-colors-tm', null)
        window.Main.send('get-settings-tm', null)

        window.Main.receive('set-audio-output-fm', (deviceId: string) => {
            setAudioOutput(deviceId)
        })

        window.Main.receive(
            'get-old-ui-colors-fm',
            (UIColors: {
                background: string
                accent: string
                text: string
                altText: string
            }) => {
                setUIColors(UIColors)
            }
        )
        window.Main.receive(
            'set-settings-fm',
            (newSettings: {
                useCover: boolean
                movingColors: boolean
                downloadCover: boolean
                transparentInactive: boolean
                bottomBar: boolean
                framelessWindow: boolean
            }) => {
                setSettings(newSettings)
            }
        )
        window.Main.receive(
            'get-settings-fm',
            (newSettings: {
                useCover: boolean
                movingColors: boolean
                downloadCover: boolean
                transparentInactive: boolean
                bottomBar: boolean
                framelessWindow: boolean
            }) => {
                setSettings(newSettings)
            }
        )

        window.Main.receive(
            'restore-session-fm',
            (
                last_open_dir: string,
                last_file: string,
                past_dirs: string[],
                last_index: number
            ) => {
                console.log(
                    'restore-session-fm',
                    last_open_dir,
                    last_file,
                    past_dirs,
                    last_index
                )
                past_dirs && setAllPlaylists(past_dirs)
                last_open_dir && openCertainDir(last_open_dir, true)
                last_file && setLastFile(last_file)
                last_index && setLastIndex(last_index)
            }
        )
        window.Main.receive('get-height-from-main', (height: number) => {
            setElectronWindowHeight(height)
        })

        window.Main.receive('add-tracks-to-playlist-fm', (dir: string) => {
            openCertainDir(dir, false)
        })

        window.Main.receive(
            'set-ui-colors-fm',
            (args: {
                background: string
                accent: string
                text: string
                altText: string
            }) => {
                setUIColors(args)
            }
        )

        window.Main.receive(
            'add-dir-fm',
            (newDirectory: string, filesData: any[], filesPaths: string[]) => {
                setActivePlaylists((activePlaylists) => ({
                    viewing: newDirectory,
                    playing: activePlaylists.playing,
                }))

                let newSongs = unpackFilesData(filesData, filesPaths)

                console.log('add-dir-fm', newSongs, activeTracks)

                setActiveTracks((activeTracks) => ({
                    viewing: newSongs,
                    playing: activeTracks.playing,
                }))
            }
        )

        window.Main.receive(
            'add-playlist-fm',
            (newDirectory: string, filesData: any[], filesPaths: string[]) => {
                setActivePlaylists((activePlaylists) => ({
                    viewing: newDirectory,
                    playing: activePlaylists.playing,
                }))
                setActiveTracks((activeTracks) => ({
                    viewing: [],
                    playing: activeTracks.playing,
                }))
            }
        )

        window.Main.receive('add-dir-from-menu', () => {
            addDir()
        })

        window.Main.receive(
            'open-dir-fm',
            (
                newDirectory: string,
                filesData: any[],
                filesPaths: string[],
                setIndexToZero: boolean
            ) => {
                let newSongs = unpackFilesData(filesData, filesPaths)
                // Nested set state is bad but I don't feel like
                // adding another useeffect for this action
                setActivePlaylists((activePlaylists) => {
                    if (newDirectory === activePlaylists.viewing) {
                        // Refresh playing directory
                        setActiveTracks((_) => ({
                            viewing: newSongs,
                            playing: newSongs,
                        }))
                    } else {
                        setActiveTracks((activeTracks) => ({
                            viewing: newSongs,
                            playing: activeTracks.playing,
                        }))
                    }

                    return {
                        viewing: newDirectory,
                        playing: activePlaylists.playing,
                    }
                })

                if (setIndexToZero) {
                    setPlaylistIndices((playlistIndices) => ({
                        viewing: 0,
                        playing: playlistIndices.playing,
                    }))
                }
            }
        )

        return () => {
            // Unmount listeners on hot-reload when debugging app
            // otherwise they keep adding making the app unusable
            window.Main.removeAllListeners()
            // Pause on hot-reload
            audio.pause()
        }
    }, [])

    // Update dynamic colors
    useEffect(() => {
        updateColors()
    }, [currentSong])

    // Bad progressbar handling. TODO: use some standard progress bar
    useEffect(() => {
        if (progress === PROGRESS_BAR_PRECISION && !repeat) {
            if (shuffle) {
                let rand_idx = Math.floor(
                    Math.random() * activeTracks.playing.length
                )
                openFile(activeTracks.playing[rand_idx].file, false, rand_idx)
            } else {
                openFile(
                    activeTracks.playing[
                        (playlistIndices.playing + 1) %
                            activeTracks.playing.length
                    ].file,
                    false,
                    (playlistIndices.playing + 1) % activeTracks.playing.length
                )
            }
        }
    }, [progress])

    useEffect(() => {
        // console.log('filterGains')
        for (let i = 0; i < filterGains.length; i++) {
            if (filters[i]) {
                filters[i].gain.value = filterGains[i]
            }
        }
    }, [JSON.stringify(filterGains)])

    useEffect(() => {
        console.log('preampGain')
        gainNode.gain.setValueAtTime(preampGain, audioContext.currentTime)
    }, [preampGain])

    return (
        <div className=" flex h-[100vh] flex-col overflow-y-hidden bg-background">
            {settings.framelessWindow && <CloseOrCollapse />}
            <div
                style={
                    settings.useCover
                        ? {
                              backgroundImage: `
                            radial-gradient(ellipse at top left, ${colors[0]}50  50%, transparent 80%),
                            radial-gradient(ellipse at bottom  left, ${colors[1]}50  50% , transparent 80%),
                            radial-gradient(ellipse at top    right, ${colors[2]}50 50% , transparent 80%),
                            radial-gradient(ellipse at bottom right, ${colors[3]}50  50% , transparent 80%)`,
                          }
                        : {}
                }
                className={`animate-bg-spin drag h-[85px] ${
                    play && settings.movingColors
                }`}
            >
                <TrackArea
                    currentSong={currentSong}
                    trackCoverRef={trackCoverRef}
                    settings={settings}
                    downloadCover={downloadCover}
                    progress={progress}
                    PROGRESS_BAR_PRECISION={PROGRESS_BAR_PRECISION}
                    setProgress={setProgress}
                    setSeek={setSeek}
                    audio={audio}
                    analyser={analyser}
                />

                <ControlsBar
                    resized={resized}
                    collapse={collapse}
                    onTop={onTop}
                    alwaysOnTop={alwaysOnTop}
                    openSettings={openSettings}
                    repeat={repeat}
                    setRepeat={setRepeat}
                    activeTracks={activeTracks}
                    playlistIndices={playlistIndices}
                    shuffle={shuffle}
                    setShuffle={setShuffle}
                    openFile={openFile}
                    play={play}
                    togglePlay={togglePlay}
                    volume={volume}
                    setVolume={setVolume}
                    preMuteVolume={preMuteVolume}
                    mute={mute}
                    setFilterGains={setFilterGains}
                    filterGains={filterGains}
                    filters={filters}
                    freqs={freqs}
                    setPreampGain={setPreampGain}
                    preampGain={preampGain}
                />
            </div>
            <div className="drag flex h-[35px] flex-none flex-row place-items-center border-b-2 border-t-2 border-border bg-background px-1">
                <div className="directory-list mb-1 flex flex-row space-x-1 overflow-x-scroll whitespace-nowrap ">
                    {allPlaylists.map((dir: string, index: number) => {
                        return (
                            <DirectoryBadge
                                key={dir}
                                activePlaylists={activePlaylists}
                                dir={dir}
                                openCertainDir={openCertainDir}
                                allPlaylists={allPlaylists}
                                index={index}
                                removeDir={removeDir}
                            />
                        )
                    })}
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            className={cn(
                                'no-drag ml-auto h-[24px] w-[24px] cursor-pointer bg-background text-foreground hover:text-background ',
                                {
                                    'animate-pulse transition-opacity duration-100':
                                        allPlaylists.length == 0,
                                }
                            )}
                            size="icon"
                        >
                            <PlusIcon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40" side="left">
                        <Button
                            className={cn(
                                'no-drag w-full cursor-pointer bg-background text-foreground hover:text-background ',
                                {
                                    'animate-pulse transition-opacity duration-100':
                                        allPlaylists.length == 0,
                                }
                            )}
                            size="sm"
                            onClick={() => {
                                addDir()
                            }}
                        >
                            Load a directory
                            <UploadIcon className="ml-1" />
                        </Button>
                        <DropdownMenuSeparator />
                        <Button
                            className={cn(
                                'no-drag w-full cursor-pointer bg-background text-foreground hover:text-background ',
                                {
                                    'animate-pulse transition-opacity duration-100':
                                        allPlaylists.length == 0,
                                }
                            )}
                            size="sm"
                            onClick={() => {
                                addPlaylist()
                            }}
                        >
                            New playlist
                            <CardStackPlusIcon className="ml-1" />
                        </Button>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div
                onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    let paths = []
                    for (const f of e.dataTransfer.files as unknown as any[]) {
                        paths.push(f.path)
                    }
                    console.log(paths)
                    window.Main.send('add-tracks-to-playlist-tm', {
                        playlist: activePlaylists.viewing,
                        paths: paths,
                    })
                }}
                onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                }}
                className="overflow-y-hide flex-1 flex-grow"
            >
                {allPlaylists.length == 0 ? (
                    <p className="text-foregound mt-2 w-full text-center text-sm">
                        {'Loaded tracks will show up here'}
                    </p>
                ) : activeTracks.viewing.length == 0 ? (
                    <p className="text-foregound mt-2 w-full text-center text-sm">
                        {'Drag and drop audio files here'}
                    </p>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={({ active }: any) => {
                            setActiveId(active.id)
                        }}
                        onDragEnd={handleDragEnd}
                        onDragCancel={() => setActiveId(null)}
                        modifiers={[restrictToVerticalAxis]}
                    >
                        <SortableContext
                            items={activeTracks.viewing.map((track) => {
                                return track.file
                            })}
                            strategy={verticalListSortingStrategy}
                        >
                            <FixedSizeList
                                useIsScrolling
                                overscanCount={10}
                                ref={listRef}
                                className={`scroll-smooth`}
                                height={
                                    electronWindowHeight -
                                    170 +
                                    (settings.bottomBar ? 20 : 50)
                                }
                                itemCount={
                                    activeTracks.viewing
                                        ? activeTracks.viewing.length
                                        : 0
                                }
                                itemSize={30}
                                itemData={{
                                    trackList: activeTracks.viewing,
                                    openFile: openFile,
                                    activePlaylists: activePlaylists,
                                    playlistIndices: playlistIndices,
                                }}
                                width={'100%'}
                            >
                                {SortableItem}
                            </FixedSizeList>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            {settings.bottomBar && (
                <BottomBar
                    play={play}
                    activeTracks={activeTracks}
                    activePlaylists={activePlaylists}
                    playlistIndices={playlistIndices}
                />
            )}
        </div>
    )
}

export default App
