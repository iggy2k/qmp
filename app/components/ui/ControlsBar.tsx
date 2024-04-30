import React from 'react'
import { Slider } from './slider'

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
    MixerVerticalIcon,
    TriangleDownIcon,
    TriangleUpIcon,
    SpeakerLoudIcon,
    SpeakerModerateIcon,
    SpeakerOffIcon,
} from '@radix-ui/react-icons'

export function ControlsBar({
    resized,
    collapse,
    onTop,
    alwaysOnTop,
    openSettings,
    repeat,
    setRepeat,
    swapTracks,
    swapIndeces,
    shuffle,
    setShuffle,
    openFile,
    play,
    togglePlay,
    volume,
    setVolume,
    preMuteVolume,
    mute,
}: any) {
    return (
        <div className="flex flex-row justify-between mt-1 mx-1 pr-2">
            <div className="flex">
                <div className="h-[24px] m-0.5">
                    <div className="">
                        <TriangleDownIcon
                            className={`no-drag origin-center ${
                                resized
                                    ? 'h-[24px] w-[24px] rotate-0 transition-transform duration-150'
                                    : 'rotate-[-180deg] h-0'
                            } `}
                            onClick={collapse}
                        />

                        <TriangleUpIcon
                            className={`no-drag origin-center ${
                                !resized
                                    ? 'h-[24px] w-[24px] rotate-0 transition-transform duration-150'
                                    : 'rotate-180 h-0 '
                            } `}
                            onClick={collapse}
                        />
                    </div>
                </div>
                <MixerVerticalIcon className="no-drag h-[24px] m-0.5" />
                {onTop ? (
                    <DrawingPinFilledIcon
                        className="no-drag h-[24px] m-0.5"
                        onClick={alwaysOnTop}
                    />
                ) : (
                    <DrawingPinIcon
                        className="no-drag h-[24px] m-0.5"
                        onClick={alwaysOnTop}
                    />
                )}
                <GearIcon
                    className="no-drag h-[24px] m-0.5"
                    onClick={() => {
                        openSettings()
                    }}
                />
            </div>
            <div className="flex">
                {repeat ? (
                    <LoopIcon
                        className="no-drag h-[24px] m-0.5 text-foreground"
                        onMouseDown={() => {
                            setRepeat(!repeat)
                        }}
                    />
                ) : (
                    <LoopIcon
                        className="no-drag h-[24px] m-0.5 text-ring"
                        onMouseDown={() => {
                            setRepeat(!repeat)
                        }}
                    />
                )}
                <TrackPreviousIcon
                    className="no-drag h-[24px] m-0.5"
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
                        className="no-drag h-[24px] m-0.5"
                        onClick={() => togglePlay()}
                    />
                ) : (
                    <PlayIcon
                        className="no-drag h-[24px] m-0.5"
                        onClick={() => togglePlay()}
                    />
                )}
                <TrackNextIcon
                    className="no-drag h-[24px] m-0.5"
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
                                  (swapIndeces[1] + 1) % swapTracks[1].length
                              )
                    }}
                />
                {shuffle ? (
                    <ShuffleIcon
                        className="no-drag h-[24px] m-0.5 text-foreground"
                        onClick={() => setShuffle(false)}
                    />
                ) : (
                    <ShuffleIcon
                        className="no-drag h-[24px] m-0.5 text-ring"
                        onClick={() => setShuffle(true)}
                    />
                )}
            </div>
            <div className="flex">
                {volume == 0 ? (
                    <SpeakerOffIcon
                        onClick={() => {
                            setVolume(preMuteVolume)
                        }}
                        className="no-drag h-[24px] m-0.5 mr-1.5"
                    />
                ) : volume < 0.5 ? (
                    <SpeakerModerateIcon
                        onClick={() => {
                            mute()
                        }}
                        className="no-drag h-[24px] m-0.5 mr-1.5"
                    />
                ) : (
                    <SpeakerLoudIcon
                        onClick={() => {
                            mute()
                        }}
                        className="no-drag h-[24px] m-0.5 mr-1.5"
                    />
                )}
                <Slider
                    defaultValue={[0.5]}
                    value={[volume]}
                    className="no-drag bg-inherit w-[100px]"
                    min={0}
                    max={1.0}
                    step={0.01}
                    onValueChange={(num) => setVolume(num[0])}
                />
            </div>
        </div>
    )
}
