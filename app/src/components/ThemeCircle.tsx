import React from 'react';

interface IProps {
    bg: string,
    accent: string,
    text: string,
    textlight: string
}

const ThemeCircle = ({ bg, accent, text, textlight }: IProps) => {
    return (
        <div className='w-[50px] h-[50px] pl-[10px] pt-[10px]'>
            <div className={`w-[50px] h-[50px] rounded-full `}
                style={{ clipPath: `inset(0 50% 0 0)`, backgroundColor: `${bg}` }}>
            </div>
            <div className={`w-[50px] h-[50px] rounded-full relative bottom-[50px] `}
                style={{ clipPath: `inset(0 0 50% 50%)`, backgroundColor: `${accent}` }}>
            </div>
            <div className={`w-[50px] h-[50px] rounded-full relative bottom-[100px] `}
                style={{ clipPath: `inset(50% 0 0 50%)`, backgroundColor: `${text}` }}>
            </div>
            <div className={`w-[50px] h-[50px] rounded-full relative bottom-[150px] `}
                style={{ clipPath: `inset(0 50% 50% 0)`, backgroundColor: `${textlight}` }}>
            </div>
        </div>
    )
}

export default ThemeCircle;
