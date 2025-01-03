import React from 'react'
import { Slider } from '@/components/primitives/slider'
import {
    ShuffleIcon,
    TrackNextIcon,
    TrackPreviousIcon,
    PlayIcon,
    PauseIcon,
    LoopIcon,
    GearIcon,
    DrawingPinFilledIcon,
    DrawingPinIcon,
    TriangleDownIcon,
    TriangleUpIcon,
    SpeakerLoudIcon,
    SpeakerModerateIcon,
    SpeakerOffIcon,
} from '@radix-ui/react-icons'
import { Equalizer } from '@/components/complex/Equalizer'
import { Controls } from '@/src/App'

export function ControlsBar(controls: Controls) {
    const {
        resized,
        collapse,
        onTop,
        alwaysOnTop,
        openSettings,
        repeat,
        setRepeat,
        shuffle,
        setShuffle,
        playNextPrev,
        play,
        togglePlay,
        volume,
        setVolume,
        preMuteVolume,
        mute,
        filterGains,
        setFilterGains,
        filters,
        freqs,
        setPreampGain,
        preampGain,
    } = controls

    return (
        <div className="mx-1 mt-0 flex flex-row justify-between pr-2 text-ring">
            <div className="flex">
                <div className="m-0.5 h-[24px] cursor-pointer">
                    <div className="">
                        <TriangleDownIcon
                            className={`no-drag origin-center transition-colors duration-300 hover:text-muted-foreground ${
                                resized
                                    ? 'h-[24px] w-[24px] rotate-0 cursor-pointer '
                                    : 'h-0 rotate-[-180deg]'
                            } `}
                            onClick={collapse}
                        />

                        <TriangleUpIcon
                            className={`no-drag origin-center transition-colors duration-300 hover:text-muted-foreground ${
                                !resized
                                    ? 'h-[24px] w-[24px] rotate-0 cursor-pointer '
                                    : 'h-0 rotate-180 '
                            } `}
                            onClick={collapse}
                        />
                    </div>
                </div>

                <Equalizer
                    filterGains={filterGains}
                    setFilterGains={setFilterGains}
                    filters={filters}
                    freqs={freqs}
                    setPreampGain={setPreampGain}
                    preampGain={preampGain}
                />

                {onTop ? (
                    <DrawingPinFilledIcon
                        className="no-drag m-0.5 h-[24px] cursor-pointer transition-colors duration-300 hover:text-muted-foreground"
                        onClick={alwaysOnTop}
                    />
                ) : (
                    <DrawingPinIcon
                        className="no-drag m-0.5 h-[24px] cursor-pointer transition-colors duration-300 hover:text-muted-foreground"
                        onClick={alwaysOnTop}
                    />
                )}
                <GearIcon
                    className="no-drag m-0.5 h-[24px] cursor-pointer transition-colors duration-300 hover:text-muted-foreground"
                    onClick={() => {
                        openSettings()
                    }}
                />
            </div>
            <div className="flex">
                {repeat ? (
                    <LoopIcon
                        className="no-drag m-0.5 h-[24px] cursor-pointer transition-colors duration-300 hover:text-muted-foreground"
                        onMouseDown={() => {
                            setRepeat(false)
                        }}
                    />
                ) : (
                    <LoopIcon
                        className="no-drag m-0.5 h-[24px] cursor-pointer text-ring/60 transition-colors duration-300 hover:text-muted-foreground"
                        onMouseDown={() => {
                            setRepeat(true)
                            setShuffle(false)
                        }}
                    />
                )}
                <TrackPreviousIcon
                    className="no-drag m-0.5 h-[24px] cursor-pointer transition-colors duration-300 hover:text-muted-foreground"
                    onClick={() => {
                        playNextPrev(false)
                    }}
                />
                {play ? (
                    <PauseIcon
                        className="no-drag m-0.5 h-[24px] cursor-pointer transition-colors duration-300 hover:text-muted-foreground"
                        onClick={() => togglePlay()}
                    />
                ) : (
                    <PlayIcon
                        className="no-drag m-0.5 h-[24px] cursor-pointer transition-colors duration-300 hover:text-muted-foreground"
                        onClick={() => togglePlay()}
                    />
                )}
                <TrackNextIcon
                    className="no-drag m-0.5 h-[24px] cursor-pointer transition-colors duration-300 hover:text-muted-foreground"
                    onClick={() => {
                        playNextPrev(true)
                    }}
                />
                {shuffle ? (
                    <ShuffleIcon
                        className="no-drag m-0.5 h-[24px] cursor-pointer text-ring transition-colors duration-300 hover:text-muted-foreground"
                        onClick={() => {
                            setShuffle(false)
                        }}
                    />
                ) : (
                    <ShuffleIcon
                        className="no-drag m-0.5 h-[24px] cursor-pointer text-ring/60 transition-colors duration-300 hover:text-muted-foreground"
                        onClick={() => {
                            setShuffle(true)
                            setRepeat(false)
                        }}
                    />
                )}
            </div>
            <div className="flex">
                {volume == 0 ? (
                    <SpeakerOffIcon
                        onClick={() => {
                            setVolume(preMuteVolume)
                        }}
                        className="no-drag m-0.5 mr-1.5 h-[24px] cursor-pointer transition-colors duration-300 hover:text-muted-foreground"
                    />
                ) : volume < 0.5 ? (
                    <SpeakerModerateIcon
                        onClick={() => {
                            mute()
                        }}
                        className="no-drag m-0.5 mr-1.5 h-[24px] cursor-pointer transition-colors duration-300 hover:text-muted-foreground"
                    />
                ) : (
                    <SpeakerLoudIcon
                        onClick={() => {
                            mute()
                        }}
                        className="no-drag m-0.5 mr-1.5 h-[24px] cursor-pointer transition-colors duration-300 hover:text-muted-foreground"
                    />
                )}
                <Slider
                    defaultValue={[0.1]}
                    value={[volume]}
                    className="no-drag w-[100px] bg-inherit"
                    min={0}
                    max={1.0}
                    step={0.01}
                    onValueChange={(num) => setVolume(num[0])}
                />
            </div>
        </div>
    )
}
