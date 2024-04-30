import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '../../lib/utils'

import { ImageIcon } from '@radix-ui/react-icons'
import { secondsToDhms } from '../../src/helpers'

export function BottomBar({ play, swapTracks, swapDirs, swapIndeces }: any) {
    return (
        <div className="drag flex-none place-items-center p-2 bg-secondary-foreground text-background">
            <div className="flex flex-row">
                <p className="text-left text-xs mx-1 w-[33%] overflow-hidden inline-block whitespace-nowrap flex-1">
                    {swapTracks[0].length > 0
                        ? secondsToDhms(
                              swapTracks[0]
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
                            swapDirs[0] == swapDirs[1] ? 'current' : 'other'
                        } folder`}
                    </p>
                </div>
                <div className="mr-1 w-[33%] flex-none inline-block ">
                    <p
                        title={swapDirs[0]}
                        className="text-xs text-right overflow-hidden whitespace-nowrap text-ellipsis"
                    >
                        {swapTracks[0].length > 0
                            ? `${swapIndeces[1] + 1} / ${swapTracks[1].length}`
                            : '0 / 0'}
                    </p>
                </div>
            </div>
        </div>
    )
}
