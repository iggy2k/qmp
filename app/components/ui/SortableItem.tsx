import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '../../lib/utils'

import { ImageIcon } from '@radix-ui/react-icons'

import { secondsToDhmsShort } from '../../src/helpers'

export function SortableItem(props: any) {
    const { index, style: styleProp, data, isScrolling, ...rest } = props

    let trackData = data.trackList[index]

    let activePlaylists = data.activePlaylists

    let playlistIndices = data.playlistIndices

    let openFile = data.openFile

    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: trackData.file, animateLayoutChanges: () => false })

    const style = {
        ...styleProp,
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                ' overflow-auto h-7 px-2',
                { 'pt-1': index == 0 },
                { 'pb-1': index == data.trackList.length - 1 }
            )}
        >
            <div
                className={cn(
                    'flex flex-row p-[1px] text-center rounded-md box-border hover:bg-accent transition-colors duration-100 text-foreground',
                    {
                        'bg-foreground text-background transition-colors duration-100 hover:bg-foreground':
                            index == playlistIndices.playing &&
                            activePlaylists.viewing == activePlaylists.playing,
                    }
                )}
                onClick={() => {
                    openFile(trackData.file, true, index)
                }}
            >
                {trackData && trackData.cover ? (
                    <img
                        className="w-[24px] h-[24px] rounded-lg flex-none"
                        src={trackData.cover}
                        alt=""
                    />
                ) : (
                    <ImageIcon className="drag min-w-[24px] min-h-[24px] max-w-[24px] max-h-[24px]" />
                )}

                <div className="text-sm place-items-center ml-2 whitespace-nowrap overflow-hidden text-ellipsis">
                    {trackData && trackData.name ? (
                        <div className="flex flex-row pt-[0.1rem]">
                            <p>
                                {trackData.name &&
                                    trackData.name.replace('\\', '')}
                            </p>
                            <p className="ml-1">
                                {trackData.author &&
                                    trackData.author.replace('\\', '')}
                            </p>
                            <p className="ml-1">
                                {trackData.album &&
                                    trackData.album.replace('\\', '')}
                            </p>
                        </div>
                    ) : (
                        <p>
                            {trackData &&
                                trackData.file
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
                        <div
                            className="rounded-md px-1 font-mono
                        "
                        >
                            {trackData &&
                                secondsToDhmsShort(trackData.duration).replace(
                                    ' : ',
                                    ':'
                                )}
                            &nbsp;|&nbsp;
                            {trackData ? trackData.format : '🎵'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
