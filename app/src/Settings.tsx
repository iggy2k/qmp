import React, { useEffect, useState, useRef } from 'react';
import ThemeCircle from './components/ThemeCircle'
import {
  PlusCircleIcon
} from '@heroicons/react/24/solid'
import { HexColorPicker } from "react-colorful";


function Settings() {

  const [tab, setTab] = useState('theme');

  const [background, setBackground] = useState("#aabbcc");
  const [accent, setAccent] = useState("#aabbcc");
  const [text, setText] = useState("#aabbcc");
  const [lightText, setLightText] = useState("#aabbcc");

  const [selected, setSelected] = useState("background");

  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className='bg-[#333333] h-[100vh] p-1 overflow-hidden'>
      <div className='grid grid-cols-3 gap-3 mt-3 bg-black/10 rounded-md m-2 h-[30px]'>

        <div className={`text-center text-[#bfbfbf] p-1 rounded-md text-sm h-[30px]
         ${tab == 'theme' ? "transition ease-in-out duration-300 border-[#f08665] border-x-[1px]  " : " hover:bg-black/10"}`}
          onClick={() => { setTab('theme') }}
        >
          <p>Themes</p>
        </div>
        <div className={`text-center text-[#bfbfbf] p-1 rounded-md text-sm h-[30px]
         ${tab == 'playlists' ? "transition ease-in-out duration-300 border-[#f08665] border-x-[1px] " : " hover:bg-black/10"}`}
          onClick={() => { setTab('playlists') }}
        >
          <p>Playlists</p>
        </div>
        <div className={`text-center text-[#bfbfbf] p-1 rounded-md text-sm h-[30px]
         ${tab == 'misc' ? "transition ease-in-out duration-300 border-[#f08665] border-x-[1px] " : " hover:bg-black/10"}`}
          onClick={() => { setTab('misc') }}
        >
          <p>Misc.</p>
        </div>
      </div>
      {tab == 'theme' ? <div className='grid grid-flow-col auto-cols-2 transition-opacity bg-black/10 m-2 pb-4'>
        <div className=''>
          <div className=' w-[100px] p-[15px] ml-7 mt-5 rounded-lg outline outline-[2px] outline-[black]/20 border-black/20 max-h-[350px] overflow-y-auto shadow-[inset_0px_-19px_30px_-27px_#000000,inset_2px_19px_30px_-27px_#000000] col-span-1'>
            <div className='w-[70px] h-[70px] rounded-[30%]
            bg-[#5c5954]/20 mb-3 hover:outline hover:outline-[#f08665]/20'>
              <ThemeCircle
                bg={'#333333'}
                accent={'#f08665'}
                text={'#6e635f'}
                textlight={'#a1918c'}
              />
            </div>
            <div className='w-[70px] h-[70px] rounded-[30%]
            bg-[#5c5954]/20  mb-3 hover:outline hover:outline-[#f08665]/20'>
              <ThemeCircle
                bg={'#7394c9'}
                accent={'#1f5cbf'}
                text={'#949494'}
                textlight={'#ebebeb'}
              />
            </div>
            <div className='w-[70px] h-[70px] rounded-[30%]
            bg-[#5c5954]/20  mb-3 hover:outline hover:outline-[#f08665]/20'>
              <ThemeCircle
                bg={'#3e4a41'}
                accent={'#3ac961'}
                text={'#000000'}
                textlight={'#323333'}
              />
            </div>
            <div className='w-[70px] h-[70px] rounded-[30%]
            bg-[#5c5954]/20  mb-3 hover:outline hover:outline-[#f08665]/20'>
              <ThemeCircle
                bg={'#3e4a41'}
                accent={'#3ac961'}
                text={'#000000'}
                textlight={'#323333'}
              />
            </div>
            <div className='w-[70px] h-[70px] rounded-[30%]
            bg-[#5c5954]/20  mb-3 hover:outline hover:outline-[#f08665]/20'>
              <ThemeCircle
                bg={'#3e4a41'}
                accent={'#3ac961'}
                text={'#000000'}
                textlight={'#323333'}
              />
            </div>
            <div className='w-[70px] h-[70px] rounded-[30%]
            bg-[#5c5954]/20  mb-3 hover:outline hover:outline-[#f08665]/20'>
              <ThemeCircle
                bg={'#3e4a41'}
                accent={'#3ac961'}
                text={'#000000'}
                textlight={'#323333'}
              />
            </div>
            <div className='w-[70px] h-[70px] rounded-[30%]
            bg-[#5c5954]/20  mb-3 hover:outline hover:outline-[#f08665]/20 pl-[10px] pt-[10px]'>
              <div className='w-[50px] h-[50px] 
              rounded-full
              bg-gradient-to-r
              bg-[linear-gradient(to right,theme(colors.blue.500),theme(colors.green.500),theme(colors.red.500),theme(colors.yellow.500))]'>

              </div>
            </div>
          </div>
        </div>

        <div className='ml-4 mt-1 px-2 col-span-1 '>
          <div className='mt-5 grid grid-flow-col auto-cols-max'>
            <div className={`w-[30px] h-[30px] rounded-md ${selected == "background" ? "border-black/20 border-[4px]" : ""}`}
              style={{ backgroundColor: `${background}` }}
              onClick={() => setSelected("background")}
            >
            </div>
            <div className='grid grid-flow-col auto-cols-2'>
              <p className='ml-4 b-1 mt-[4px] text-[#bfbfbf] font-extrabold min-w-[75px]'>{background}</p>
              <p className='ml-4 b-1 mt-[4px] text-[#bfbfbf] font-extrabold'>Background</p>
            </div>
          </div>
          <div className='mt-5 grid grid-flow-col auto-cols-max'>
            <div className={`w-[30px] h-[30px] rounded-md ${selected == "accent" ? "border-black/20 border-[4px]" : ""}`}
              style={{ backgroundColor: `${accent}` }}
              onClick={() => setSelected("accent")}
            >
            </div>
            <div className='grid grid-flow-col auto-cols-2'>
              <p className='ml-4 b-1 mt-[4px] text-[#bfbfbf] font-extrabold min-w-[75px]'>{accent}</p>
              <p className='ml-4 b-1 mt-[4px] text-[#bfbfbf] font-extrabold'>Accent</p>
            </div>
          </div>
          <div className='mt-5 grid grid-flow-col auto-cols-max'>
            <div className={`w-[30px] h-[30px] rounded-md ${selected == "text" ? "border-black/20 border-[4px]" : ""}`}
              style={{ backgroundColor: `${text}` }}
              onClick={() => setSelected("text")}
            >
            </div>
            <div className='grid grid-flow-col auto-cols-2'>
              <p className='ml-4 b-1 mt-[4px] text-[#bfbfbf] font-extrabold min-w-[75px]'>{text}</p>
              <p className='ml-4 b-1 mt-[4px] text-[#bfbfbf] font-extrabold'>Text</p>
            </div>
          </div>
          <div className='mt-5 grid grid-flow-col auto-cols-max'>
            <div className={`w-[30px] h-[30px] rounded-md ${selected == "lightText" ? "border-black/20 border-[4px]" : ""}`}
              style={{ backgroundColor: `${lightText}` }}
              onClick={() => setSelected("lightText")}
            >
            </div>
            <div className='grid grid-flow-col auto-cols-2'>
              <p className='ml-4 b-1 mt-[4px] text-[#bfbfbf] font-extrabold min-w-[75px]'>{lightText}</p>
              <p className='ml-4 b-1 mt-[4px] text-[#bfbfbf] font-extrabold'>Light text</p>
            </div>
          </div>

          <div className='grid grid-flow-col grid-cols-2 mt-4
          min-w-[500px] min-h-[100px]'>
            <HexColorPicker
              className=' max-h-[100px] max-w-[240px] min-w-[240px]'
              color={selected == "background" ? background :
                selected == "accent" ? accent :
                  selected == "text" ? text :
                    selected == "lightText" ? lightText : "#000000"

              } onChange={selected == "background" ? setBackground :
                selected == "accent" ? setAccent :
                  selected == "text" ? setText :
                    selected == "lightText" ? setLightText : () => null} />
          </div>

          <div className='grid grid-flow-col grid-cols-2 max-w-[240px] gap-3 mt-2'>
            <div className="text-center text-[#bfbfbf] p-2 rounded-md col-span-1	
         border-[#f08665] border-b-[1px] 5] hover:bg-black/10
         "
            >
              <p>Add</p>
            </div>
            <div className="text-center text-[#bfbfbf] p-2 rounded-md col-span-1	
        border-[#f08665] border-b-[1px] hover:bg-black/10"
            >
              <p>Randomize</p>
            </div>
          </div>
        </div>
      </div>
        : null}
    </div >
  );
}

export default Settings;
