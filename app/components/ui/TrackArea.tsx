import React from 'react'
import { Slider } from './slider'

import { ImageIcon } from '@radix-ui/react-icons'

import { secondsToDhmsShort } from '../../src/helpers'

export function TrackArea({
    currSong,
    trackCoverRef,
    settings,
    downloadCover,
    progress,
    PROGRESS_BAR_PRECISION,
    setProgress,
    setSeek,
    audio,
}: any) {
    return (
        <div className="flex">
            <div className="no-drag p-2 pb-0">
                <div className="flex-none w-[48px] h-[48px]">
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
                                currSong && settings.downloadCover
                                    ? downloadCover(currSong.cover)
                                    : null
                            }}
                            alt=""
                            title={
                                settings.downloadCover
                                    ? 'Click to download the cover art'
                                    : ''
                            }
                        />
                    ) : (
                        <ImageIcon className="drag ml-[0.1rem] w-[48px] h-[48px] rounded-[10px]" />
                    )}
                </div>
            </div>
            <div className="ml-1 mt-2 flex-1">
                {!currSong ||
                    (currSong && !currSong.file && (
                        <p className="no-drag text-xs">
                            Track name will be here
                        </p>
                    ))}
                <p className="no-drag text-xs">
                    {currSong &&
                        currSong.file &&
                        currSong.file
                            .split('/')
                            .reverse()[0]
                            .replace(/\.[^/.]+$/, '')}
                </p>
                <div className="drag grid grid-flow-col auto-cols-max text-xs">
                    {!currSong ||
                        (currSong && !currSong.file && (
                            <p>Album name will be here</p>
                        ))}
                    {currSong && currSong.album && <p>{currSong.album}</p>}
                </div>
                <div className="w-full flex flex-row">
                    <Slider
                        defaultValue={[0]}
                        value={[progress]}
                        className="no-drag bg-inherit w-[calc(100%_-_125px)]"
                        min={0}
                        max={PROGRESS_BAR_PRECISION}
                        step={0.001}
                        onValueChange={(num) => {
                            if (audio) {
                                let userInputProgress = num[0]
                                let userInputTime = Math.trunc(
                                    (userInputProgress /
                                        PROGRESS_BAR_PRECISION) *
                                        audio.duration
                                )

                                if (
                                    !Number.isNaN(userInputTime) &&
                                    userInputTime !== Infinity
                                ) {
                                    setProgress(userInputProgress)
                                    setSeek(userInputTime)
                                }
                            }
                        }}
                    />

                    <p className="text-xs mr-2 flex-1 text-right font-light pr-1">
                        {secondsToDhmsShort(audio.currentTime)}
                        &nbsp;/&nbsp;
                        {currSong && secondsToDhmsShort(currSong.duration)}
                    </p>
                </div>
            </div>
        </div>
    )
}
