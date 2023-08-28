import React, { useEffect, useState, useRef } from 'react';
import ThemeCircle from './components/ThemeCircle'

function Settings() {

  const [tab, setTab] = useState('theme');

  return (
    <div className=''>
      <div className='grid grid-cols-3 place-items-center mt-4'>
        <div className={`w-[90px] text-center ${tab == 'theme' ? "bg-blue-400" : "bg-blue-400/40"}  rounded-lg`}
          onClick={() => { setTab('theme') }}
        >
          <p>Themes</p>
        </div>
        <div className={`w-[90px] text-center ${tab == 'playlists' ? "bg-green-400" : "bg-green-400/40"}  rounded-lg`}
          onClick={() => { setTab('playlists') }}
        >
          <p>Playlists</p>
        </div>
        <div className={`w-[90px] text-center ${tab == 'misc' ? "bg-orange-400" : "bg-orange-400/40"}  rounded-lg`}
          onClick={() => { setTab('misc') }}
        >
          <p>Misc.</p>
        </div>
      </div>
      <div className='h-[85vh] border-[4px] border-black/20 m-2 mt-4'>
        <div className='m-5'>

          {/* <div className='w-[50px] h-[50px]'>
            <div className={`bg-['#333333'] w-[50px] h-[50px] rounded-full`}
              style={{ clipPath: `inset(0 50% 0 0)` }}>
            </div>
            <div className={`bg-[#f08665] w-[50px] h-[50px] rounded-full relative bottom-[50px]`}
              style={{ clipPath: `inset(0 0 50% 50%)` }}>
            </div>
            <div className={`bg-[#6e635f] w-[50px] h-[50px] rounded-full relative bottom-[100px]`}
              style={{ clipPath: `inset(50% 0 0 50%)` }}>
            </div>
            <div className={`bg-[#a1918c] w-[50px] h-[50px] rounded-full relative bottom-[150px]`}
              style={{ clipPath: `inset(0 50% 50% 0)` }}>
            </div>
          </div> */}
          <div className='grid grid-flow-col auto-cols-max w-[40%] border-[1px] p-2 rounded-lg border-white/50'>
            <ThemeCircle
              bg={'#333333'}
              accent={'#f08665'}
              text={'#6e635f'}
              textlight={'#a1918c'}
            />
            <p className='ml-5 mt-[12px] text-white font-semibold'>Default</p>
          </div>


          <ThemeCircle
            bg={'#7394c9'}
            accent={'#1f5cbf'}
            text={'#949494'}
            textlight={'#ebebeb'}
          />

        </div>
      </div>
    </div >
  );
}

export default Settings;
