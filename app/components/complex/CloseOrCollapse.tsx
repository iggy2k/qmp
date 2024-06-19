import React from 'react'

export function CloseOrCollapse({}: any) {
    return (
        <div className="grid grid-flow-col auto-cols-max pt-3 px-3 gap-3 opacity-0 hover:opacity-100 transition-opacity	fixed min-w-full h-[40px] shadow-[inset_2px_25px_25px_-26px_#000000]">
            <div
                className="no-drag h-[12px] w-[12px] bg-red-500 hover:bg-[#b52424] rounded-full"
                onClick={() => {
                    window.Main.Close()
                }}
            ></div>
            <div
                className="no-drag h-[12px] w-[12px] bg-yellow-500 hover:bg-[#939624] rounded-full"
                onClick={() => {
                    window.Main.Minimize()
                }}
            ></div>
        </div>
    )
}
