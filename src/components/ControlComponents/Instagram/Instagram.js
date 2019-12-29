import React, { useState } from 'react';
import style from './Instagram.module.sass';

import Switch from '@material-ui/core/Switch'

import { donwloadVideo, donwloadStory } from '../../../API/Instagram/load';

function log(){
    console.log('click')
}

function Instagram(props){
    const [lVideo, setLVideo] = useState(false);
    const [lStory, setLStory] = useState(false);

    const setDonwloadVideo = () => {
        if(lVideo){
            window.addEventListener('dblclick', log);
        }else{
            window.removeEventListener('dblclick', log)
        }
        return setLVideo(lVideo => !lVideo);
    };

    const setDonwloadStory = () => {
        if(lStory){
            window.addEventListener('dblclick', log);
        }else{
            window.removeEventListener('dblclick', log)
        }
        return setLStory(lStory => !lStory);
    };


    const placeHolder = (text) => {
        return(
            <span className={style.placeholder}>
                {text}
            </span>
        )
    }

    return(
        <div className={style.container}>
            <div>
                <span className={style.text}>
                    Donwload video
                </span>
                <Switch
                    checked={lVideo}
                    onChange={() => setDonwloadVideo()}
                />  
            </div>
            {lVideo && placeHolder('two click on video')}
            <div>
                <span className={style.text}>
                    Donwload story
                </span>
                <Switch
                    checked={lStory}
                    onChange={() => setDonwloadStory()}
                />  
            </div>
            {lStory && placeHolder('two click on video')}
        </div>
    )
}

export default Instagram;