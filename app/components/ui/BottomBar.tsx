import React from 'react'
import { secondsToDhms } from '../../src/helpers'

export function BottomBar({
    play,
    activeTracks,
    activePlaylists,
    playlistIndices,
}: any) {
    return (
        <div className="drag flex-none place-items-center p-2 bg-background text-foreground">
            <div className="flex flex-row">
                <p className="text-left text-xs mx-1 w-[33%] overflow-hidden inline-block whitespace-nowrap flex-1">
                    {activeTracks.viewing.length > 0
                        ? secondsToDhms(
                              activeTracks.viewing
                                  .map(function (song: any) {
                                      return song.duration
                                  })
                                  .reduce((acc: number, curr: number) => {
                                      return acc + curr
                                  }, 0)
                          )
                        : '0d 0h 0m 0s'}
                </p>
                <div className="mr-1 w-[33%] flex-none inline-block ">
                    <p className="text-xs text-center overflow-hidden whitespace-nowrap text-ellipsis">
                        {`${play ? 'Playing' : 'Paused'} ${
                            activePlaylists.viewing == activePlaylists.playing
                                ? 'current'
                                : 'other'
                        } folder`}
                    </p>
                </div>
                <div className="mr-1 w-[33%] flex-none inline-block ">
                    <p
                        title={activePlaylists.viewing}
                        className="text-xs text-right overflow-hidden whitespace-nowrap text-ellipsis"
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
