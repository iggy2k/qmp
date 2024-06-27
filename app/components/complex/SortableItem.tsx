import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'

import { ImageIcon } from '@radix-ui/react-icons'

import { secondsToDhmsShort } from '@/src/helpers'

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from '@/components/primitives/context-menu'

export function SortableItem(props: any) {
    const { index, style: styleProp, data, isScrolling, ...rest } = props

    let trackData = data.trackList[index]

    let activePlaylists = data.activePlaylists

    let playlistIndices = data.playlistIndices

    let openFile = data.openFile

    let activeId = data.activeId

    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: trackData.file, animateLayoutChanges: () => false })

    const style = {
        ...styleProp,
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <div
                    ref={setNodeRef}
                    style={style}
                    {...attributes}
                    {...listeners}
                    className={cn(
                        ' h-7 overflow-auto px-2',
                        { 'pt-1': index == 0 },
                        { 'pb-1': index == data.trackList.length - 1 }
                    )}
                >
                    <div
                        className={cn(
                            'box-border flex flex-row rounded-md p-[1px] text-center text-foreground transition-colors duration-100 hover:bg-accent',
                            {
                                'border-y-[1px] border-foreground':
                                    activeId === trackData.file,
                            },
                            {
                                'bg-foreground text-background transition-colors duration-100 hover:bg-foreground':
                                    index == playlistIndices.playing &&
                                    activePlaylists.viewing ==
                                        activePlaylists.playing,
                            }
                        )}
                        onClick={() => {
                            openFile(trackData.file, true, index)
                        }}
                    >
                        {trackData && trackData.cover ? (
                            <img
                                className="h-[24px] w-[24px] flex-none rounded-lg"
                                src={trackData.cover}
                                alt=""
                            />
                        ) : (
                            <ImageIcon className="drag max-h-[24px] min-h-[24px] min-w-[24px] max-w-[24px]" />
                        )}

                        <div className="ml-2 place-items-center overflow-hidden text-ellipsis whitespace-nowrap text-sm">
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

                        <div className="ml-auto flex place-items-center">
                            <div
                                style={{
                                    fontSize: '0.65rem',
                                    lineHeight: '1.1rem',
                                }}
                                className="grid grid-flow-col rounded-md p-[0.1rem] font-mono text-xs"
                            >
                                <div
                                    className="rounded-md px-1 font-mono
                        "
                                >
                                    {trackData &&
                                        secondsToDhmsShort(
                                            trackData.duration
                                        ).replace(' : ', ':')}
                                    &nbsp;|&nbsp;
                                    {trackData ? trackData.format : '🎵'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem
                    onClick={() => {
                        window.Main.send('remove-track-from-playlist-tm', {
                            track_file: trackData.file,
                            playlist: activePlaylists.viewing,
                        })
                    }}
                >
                    Remove
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}
