import React from 'react'

export function CloseOrCollapse() {
    return (
        <div className="fixed z-50 grid h-[40px] min-w-full auto-cols-max grid-flow-col gap-3 px-3	pt-3 opacity-0 shadow-[inset_2px_25px_35px_-25px_#000000] transition-opacity duration-200 hover:opacity-100">
            <div
                className="no-drag h-[12px] w-[12px] cursor-pointer rounded-full bg-red-500 hover:bg-[#b52424]"
                onClick={() => {
                    window.Main.Close()
                }}
            ></div>
            <div
                className="no-drag h-[12px] w-[12px] cursor-pointer rounded-full bg-yellow-500 hover:bg-[#939624]"
                onClick={() => {
                    window.Main.Minimize()
                }}
            ></div>
        </div>
    )
}
