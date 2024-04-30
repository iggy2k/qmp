import React from 'react'
import { cn } from '../../lib/utils'

import { Badge } from './badge'

export function DirectoryBadge({
    swapDirs,
    dir,
    openCertainDir,
    directories,
    index,
    removeDir,
}: any) {
    return (
        <div
            onClick={() => {
                swapDirs[0] !== dir && openCertainDir(dir, true)
            }}
            className="no-drag"
        >
            <Badge
                className={cn(
                    '',
                    {
                        'bg-foreground text-background': swapDirs[0] == dir,
                    },
                    {
                        'bg-muted-foreground text-background':
                            swapDirs[1] == dir,
                    }
                )}
                variant={'secondary'}
            >
                <p>
                    {directories[index] &&
                        directories[index].split('/').reverse()[0]}
                </p>
                <div
                    className="pl-1 inline-block opacity-30 hover:opacity-100 transition-opacity"
                    onClick={(e) => removeDir(e, index)}
                >
                    X
                </div>
            </Badge>
        </div>
    )
}
