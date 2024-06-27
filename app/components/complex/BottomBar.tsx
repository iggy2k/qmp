import React from 'react'
import { secondsToDhms } from '@/src/helpers'

import { TrackCouple, PlaylistCouple, IndexCouple, Track } from '@/src/App'

export function BottomBar({
    play,
    activeTracks,
    activePlaylists,
    playlistIndices,
}: {
    play: boolean
    activeTracks: TrackCouple
    activePlaylists: PlaylistCouple
    playlistIndices: IndexCouple
}) {
    return (
        <div className="drag flex-none place-items-center bg-background p-2 text-foreground">
            <div className="flex flex-row">
                <p className="mx-1 inline-block w-[33%] flex-1 overflow-hidden whitespace-nowrap text-left text-xs">
                    {activeTracks.viewing.length > 0
                        ? secondsToDhms(
                              activeTracks.viewing
                                  .map(function (song: Track) {
                                      return song.duration
                                  })
                                  .reduce((acc: number, curr: number) => {
                                      return acc + curr
                                  }, 0)
                          )
                        : '0d 0h 0m 0s'}
                </p>
                <div className="mr-1 inline-block w-[33%] flex-none ">
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-xs">
                        {`${play ? 'Playing' : 'Paused'} ${
                            activePlaylists.viewing == activePlaylists.playing
                                ? 'current'
                                : 'other'
                        } folder`}
                    </p>
                </div>
                <div className="mr-1 inline-block w-[33%] flex-none ">
                    <p
                        title={activePlaylists.viewing}
                        className="overflow-hidden text-ellipsis whitespace-nowrap text-right text-xs"
                    >
                        {activeTracks.viewing.length > 0
                            ? `${playlistIndices.playing + 1} / ${activeTracks.playing.length}`
                            : '0 / 0'}
                    </p>
                </div>
            </div>
        </div>
    )
}
