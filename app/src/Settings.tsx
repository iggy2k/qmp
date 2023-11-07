import React, { useEffect, useState, useRef } from 'react'
import { HexColorPicker } from 'react-colorful'
import { invertColor, randomHexColor } from './helpers'
import { IconAlertHexagon } from '@tabler/icons-react'

function Settings() {
    const [tab, setTab] = useState('appearance')

    const [background, setBackground] = useState('#aabbcc')
    const [accent, setAccent] = useState('#aabbcc')
    const [text, setText] = useState('#aabbcc')
    const [altText, setAltText] = useState('#aabbcc')

    const [isChecked, setIsChecked] = useState(false)
    const handleCheckboxChange = () => {
        setIsChecked(!isChecked)
    }

    const [selected, setSelected] = useState('background')

    const [showPicker, setShowPicker] = useState(false)

    const setRandomColors = () => {
        setBackground(randomHexColor())
        setAccent(randomHexColor())
        setText(randomHexColor())
        setAltText(randomHexColor())
    }

    return (
        <div className="bg-[#333333] h-[100vh] p-1 overflow-hidden drag">
            <div className="grid grid-cols-3 gap-3 mt-3 bg-black/10 rounded-md m-2 h-[30px]">
                <div
                    className={`no-drag text-center text-[#bfbfbf] p-1 rounded-md text-sm h-[30px]
         ${
             tab == 'appearance'
                 ? 'transition ease-in-out duration-300 border-[#f08665] border-x-[1px]  '
                 : ' hover:bg-black/10'
         }`}
                    onClick={() => {
                        setTab('appearance')
                    }}
                >
                    <p>Features</p>
                </div>
                <div
                    className={`no-drag text-center text-[#bfbfbf] p-1 rounded-md text-sm h-[30px]
         ${
             tab == 'colors'
                 ? 'transition ease-in-out duration-300 border-[#f08665] border-x-[1px] '
                 : ' hover:bg-black/10'
         }`}
                    onClick={() => {
                        setTab('colors')
                    }}
                >
                    <p>Colors</p>
                </div>
                <div
                    className={`no-drag text-center text-[#bfbfbf] p-1 rounded-md text-sm h-[30px]
         ${
             tab == 'misc'
                 ? 'transition ease-in-out duration-300 border-[#f08665] border-x-[1px] '
                 : ' hover:bg-black/10'
         }`}
                    onClick={() => {
                        setTab('misc')
                    }}
                >
                    <p>Misc.</p>
                </div>
            </div>
            {tab == 'appearance' ? (
                <div className="grid grid-flow-col auto-cols-2 transition-opacity bg-black/10 m-1 pb-4">
                    <div className="no-drag  flex flex-col p-2">
                        <div className="w-max flex mb-2">
                            <input
                                type="checkbox"
                                id="use-cover"
                                className="relative w-[1.77rem] h-4 bg-red-400  checked:bg-none checked:bg-green-600 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 border border-transparent ring-1 ring-transparent focus:border-white/50 focus:ring-white/50 ring-offset-white focus:outline-none appearance-none dark:bg-gray-700 dark:checked:bg-green-600 dark:focus:ring-offset-gray-800

before:inline-block before:w-3 before:h-3 before:mb-[1rem] before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:shadow before:rounded-full before:transform before:ring-0 before:transition before:ease-in-out before:duration-200 dark:before:bg-gray-400 dark:checked:before:bg-blue-200"
                            />
                            <label
                                className="align-items-center pl-[0.4rem] hover:cursor-pointer text-white text-xs
                                "
                                htmlFor="use-cover"
                            >
                                Use cover for track colors
                            </label>
                        </div>
                        <div className="w-max flex mb-2">
                            <input
                                type="checkbox"
                                id="move-colors"
                                className="relative w-[1.77rem] h-4 bg-red-400  checked:bg-none checked:bg-green-600 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 border border-transparent ring-1 ring-transparent focus:border-white/50 focus:ring-white/50 ring-offset-white focus:outline-none appearance-none dark:bg-gray-700 dark:checked:bg-green-600 dark:focus:ring-offset-gray-800

before:inline-block before:w-3 before:h-3 before:mb-[1rem] before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:shadow before:rounded-full before:transform before:ring-0 before:transition before:ease-in-out before:duration-200 dark:before:bg-gray-400 dark:checked:before:bg-blue-200"
                            />
                            <label
                                className="align-items-center pl-[0.4rem] hover:cursor-pointer text-white text-xs
                                "
                                htmlFor="move-colors"
                            >
                                Moving track colors
                            </label>
                        </div>
                        <div className="w-max flex mb-2">
                            <input
                                type="checkbox"
                                id="download-cover"
                                className="relative w-[1.77rem] h-4 bg-red-400  checked:bg-none checked:bg-green-600 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 border border-transparent ring-1 ring-transparent focus:border-white/50 focus:ring-white/50 ring-offset-white focus:outline-none appearance-none dark:bg-gray-700 dark:checked:bg-green-600 dark:focus:ring-offset-gray-800

before:inline-block before:w-3 before:h-3 before:mb-[1rem] before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:shadow before:rounded-full before:transform before:ring-0 before:transition before:ease-in-out before:duration-200 dark:before:bg-gray-400 dark:checked:before:bg-blue-200"
                            />
                            <label
                                className="align-items-center pl-[0.4rem] hover:cursor-pointer text-white text-xs
                                "
                                htmlFor="download-cover"
                            >
                                Click cover to download
                            </label>
                        </div>
                        <div className="w-max flex">
                            <input
                                type="checkbox"
                                id="transparent-inactive"
                                className="relative w-[1.77rem] h-4 bg-red-400  checked:bg-none checked:bg-green-600 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 border border-transparent ring-1 ring-transparent focus:border-white/50 focus:ring-white/50 ring-offset-white focus:outline-none appearance-none dark:bg-gray-700 dark:checked:bg-green-600 dark:focus:ring-offset-gray-800

before:inline-block before:w-3 before:h-3 before:mb-[1rem] before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:shadow before:rounded-full before:transform before:ring-0 before:transition before:ease-in-out before:duration-200 dark:before:bg-gray-400 dark:checked:before:bg-blue-200"
                            />
                            <label
                                className="align-items-center pl-[0.4rem] hover:cursor-pointer text-white text-xs
                                "
                                htmlFor="transparent-inactive"
                            >
                                Transparency when inactive
                            </label>
                            <div title="Requires restarting the app.">
                                <IconAlertHexagon className="pb-[0.4rem] h-[24px] text-red-400" />
                            </div>
                        </div>
                        <div className="w-max flex mb-2">
                            <input
                                type="checkbox"
                                id="bottom-bar"
                                className="relative w-[1.77rem] h-4 bg-red-400  checked:bg-none checked:bg-green-600 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 border border-transparent ring-1 ring-transparent focus:border-white/50 focus:ring-white/50 ring-offset-white focus:outline-none appearance-none dark:bg-gray-700 dark:checked:bg-green-600 dark:focus:ring-offset-gray-800

before:inline-block before:w-3 before:h-3 before:mb-[1rem] before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:shadow before:rounded-full before:transform before:ring-0 before:transition before:ease-in-out before:duration-200 dark:before:bg-gray-400 dark:checked:before:bg-blue-200"
                            />
                            <label
                                className="align-items-center pl-[0.4rem] hover:cursor-pointer text-white text-xs
                                "
                                htmlFor="bottom-bar"
                            >
                                Bottom information bar
                            </label>
                        </div>
                        <div className="w-max flex mb-2">
                            <input
                                type="checkbox"
                                id="frameless"
                                className="relative w-[1.77rem] h-4 bg-red-400  checked:bg-none checked:bg-green-600 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 border border-transparent ring-1 ring-transparent focus:border-white/50 focus:ring-white/50 ring-offset-white focus:outline-none appearance-none dark:bg-gray-700 dark:checked:bg-green-600 dark:focus:ring-offset-gray-800

before:inline-block before:w-3 before:h-3 before:mb-[1rem] before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:shadow before:rounded-full before:transform before:ring-0 before:transition before:ease-in-out before:duration-200 dark:before:bg-gray-400 dark:checked:before:bg-blue-200"
                            />
                            <label
                                className="align-items-center pl-[0.4rem] hover:cursor-pointer text-white text-xs
                                "
                                htmlFor="frameless"
                            >
                                Frameless window
                            </label>
                            <div title="Requires restarting the app.">
                                <IconAlertHexagon className=" pb-[0.4rem] h-[24px] text-red-400" />
                            </div>
                        </div>
                    </div>
                </div>
            ) : tab == 'colors' ? (
                <div className="rounded-md m-1 p-2 grid grid-flow-row grid-cols-2  bg-black/10">
                    <div className="no-drag mt-1 grid grid-flow-col auto-cols-max">
                        <div
                            className={
                                `w-[35px] h-[20px]` +
                                (selected == 'background' ? ` border-2` : '')
                            }
                            style={{
                                backgroundColor: `${background}`,
                                borderColor: `${invertColor(background)}`,
                            }}
                            onClick={() => setSelected('background')}
                        ></div>
                        <div className="grid grid-flow-col auto-cols-2">
                            <p className="ml-4 b-1 text-[#bfbfbf] font-semi text-sm">
                                Background
                            </p>
                        </div>
                    </div>
                    <div className="no-drag mt-1 grid grid-flow-col auto-cols-max">
                        <div
                            className={
                                `w-[35px] h-[20px]` +
                                (selected == 'accent' ? ` border-2` : '')
                            }
                            style={{
                                backgroundColor: `${accent}`,
                                borderColor: `${invertColor(accent)}`,
                            }}
                            onClick={() => setSelected('accent')}
                        ></div>
                        <div className="grid grid-flow-col auto-cols-2">
                            <p className="ml-4 b-1 text-[#bfbfbf] font-semi text-sm">
                                Accent
                            </p>
                        </div>
                    </div>
                    <div className="no-drag mt-1 grid grid-flow-col auto-cols-max">
                        <div
                            className={
                                `w-[35px] h-[20px]` +
                                (selected == 'text' ? ` border-2` : '')
                            }
                            style={{
                                backgroundColor: `${text}`,
                                borderColor: `${invertColor(text)}`,
                            }}
                            onClick={() => setSelected('text')}
                        ></div>
                        <div className="grid grid-flow-col auto-cols-2">
                            <p className="ml-4 b-1 text-[#bfbfbf] font-semi text-sm">
                                Text
                            </p>
                        </div>
                    </div>
                    <div className="no-drag mt-1 grid grid-flow-col auto-cols-max">
                        <div
                            className={
                                `w-[35px] h-[20px]` +
                                (selected == 'altText' ? ` border-2` : '')
                            }
                            style={{
                                backgroundColor: `${altText}`,
                                borderColor: `${invertColor(altText)}`,
                            }}
                            onClick={() => setSelected('altText')}
                        ></div>
                        <div className="grid grid-flow-col auto-cols-2">
                            <p className="ml-4 b-1 text-[#bfbfbf] font-semi text-sm">
                                Alt text
                            </p>
                        </div>
                    </div>

                    <div
                        className="grid grid-flow-col grid-cols-2 my-4
min-h-[100px]"
                    >
                        <HexColorPicker
                            className="no-drag max-h-[100px] max-w-[240px]"
                            color={
                                selected == 'background'
                                    ? background
                                    : selected == 'accent'
                                    ? accent
                                    : selected == 'text'
                                    ? text
                                    : selected == 'altText'
                                    ? altText
                                    : '#000000'
                            }
                            onChange={
                                selected == 'background'
                                    ? setBackground
                                    : selected == 'accent'
                                    ? setAccent
                                    : selected == 'text'
                                    ? setText
                                    : selected == 'altText'
                                    ? setAltText
                                    : () => null
                            }
                        />
                    </div>

                    <div className="grid grid-flow-row w-[70%] items-center">
                        <div
                            className="no-drag text-center text-[#bfbfbf] p-2 rounded-md	
border-[#f08665] border-b-[1px] hover:bg-black/10 h-[40px]"
                            onClick={() => {
                                setRandomColors()
                            }}
                        >
                            <p>Randomize</p>
                        </div>
                        <div
                            className="no-drag text-center text-[#bfbfbf] p-2 rounded-md	
border-[#f08665] border-b-[1px] hover:bg-black/10 h-[40px]"
                            onClick={() => {
                                setRandomColors()
                            }}
                        >
                            <p>Apply</p>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

export default Settings
