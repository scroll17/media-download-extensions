/*global chrome*/
import React, { useState } from 'react';
import style from './Instagram.module.sass';

import Switch from '@material-ui/core/Switch'

function sendMessage(type, data){
    chrome.extension.sendMessage({
        type: `instagram-${type}`,
        data
    });
}

function Instagram(props){
    const { DOMStatus } = props;

    const [lVideo, setLVideo] = useState(false);
    const [lStory, setLStory] = useState(false);

    const setDownloadVideo = () => {
        if(DOMStatus.load){
            if(lStory) setDownloadStory();

            if(lVideo){
                sendMessage('stop',{ openInNewWindow: false });
            } else {
                sendMessage('start',{ openInNewWindow: false });
            }

            return setLVideo(lVideo => !lVideo);
        }
    };

    const setDownloadStory = () => {
        if(DOMStatus.load){
            if(lVideo) setDownloadVideo();

            if(lStory){
                sendMessage('stop',{ openInNewWindow: false });
            } else {
                sendMessage('start',{ openInNewWindow: false });
            }

            return setLStory(lStory => !lStory);
        }
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
                Instagram page: {
                    DOMStatus.load ?
                        <i className="fas fa-check-circle"/> :
                        <i className="fas fa-times-circle"/>
                }
            </div>
            <div>
                <span className={style.text}>
                    Download video
                </span>
                <Switch
                    checked={lVideo}
                    onChange={() => setDownloadVideo()}
                />  
            </div>
            {lVideo && placeHolder('two click on video')}
            <div>
                <span className={style.text}>
                    Download story
                </span>
                <Switch
                    checked={lStory}
                    onChange={() => setDownloadStory()}
                />  
            </div>
            {lStory && placeHolder('two click on stories')}
        </div>
    )
}

export default Instagram;