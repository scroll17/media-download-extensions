/*global chrome*/
import React, { useState } from 'react';
import style from './Instagram.module.sass';

import Switch from '@material-ui/core/Switch'

import { donwloadVideo, donwloadStory } from '../../../API/Instagram/load';

function log(){
    console.log('click')
}

document.addEventListener('dblclick', () => {
    console.log("Popup DOM fully loaded and parsed");

    function modifyDOM() {
        //You can play with your DOM here or check URL against your regex
        console.log('Tab script:');
        console.log(document.body);
        return document.body.innerHTML;
    }

    //We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
    chrome.tabs.executeScript({
        code: '(' + modifyDOM + ')();' //argument here is a string but function.toString() returns function's code
    }, (results) => {
        //Here we have just the innerHTML and not DOM structure
        console.log('Popup script:')
        console.log(results[0]);
    });
});

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