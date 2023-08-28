import React from 'react';

interface IProps {
    bg: string,
    accent: string,
    text: string,
    textlight: string
}

const ThemeCircle = ({ bg, accent, text, textlight }: IProps) => {
    return (
        <div className='w-[50px] h-[50px]'>
            <div className={`bg-[${bg}] w-[50px] h-[50px] rounded-full`}
                style={{ clipPath: `inset(0 50% 0 0)` }}>
            </div>
            <div className={`bg-[${accent}] w-[50px] h-[50px] rounded-full relative bottom-[50px]`}
                style={{ clipPath: `inset(0 0 50% 50%)` }}>
            </div>
            <div className={`bg-[${text}] w-[50px] h-[50px] rounded-full relative bottom-[100px]`}
                style={{ clipPath: `inset(50% 0 0 50%)` }}>
            </div>
            <div className={`bg-[${textlight}] w-[50px] h-[50px] rounded-full relative bottom-[150px]`}
                style={{ clipPath: `inset(0 50% 50% 0)` }}>
            </div>
        </div>
    )
}

export default ThemeCircle;
