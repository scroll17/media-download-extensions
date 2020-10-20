import { TimePicker, DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import React, {useEffect, useState} from 'react';
import MomentUtils from '@date-io/moment';

import moment from "moment";

import style from './Main.module.sass';
import {getLocalFile} from "../../utils/getLocalFile";
import { ContentType } from "../../utils/contentType";

const SERVER_URL = 'instagram-publisher-server-url'
const DATA_ID = 'instagram-publisher-data-id'
const DATA_TOKEN = 'instagram-publisher-data-token'

function setIfExist(obj, key, value) {
    if(value) {
        obj[key] = value
    }
}

export function Main() {
    const [headers] = useState({
        'x-client-token': localStorage.getItem(DATA_TOKEN) ?? '',
        'x-user-id': localStorage.getItem(DATA_ID) ?? '',
        'Content-Type': 'application/json'
    })

    const [items, setItems] = useState(JSON.parse(localStorage.getItem('instagram-publisher-items') ?? '[]'))
    const [selectedItem, selectItem] = useState(null);

    const [caption, setCation] = useState(null)
    const [selectedDate, handleDateChange] = useState(
        moment()
            .add(5, 'minutes')
            .toDate()
    );

    const send = async () => {
        const { type, coverImage, videoUrl } = selectedItem;
        const data = {
            type,
            imgUrl: coverImage,
            desiredTime: (moment.isMoment(selectedDate) ? selectedDate.toDate() : selectedDate).toLocaleString()
        }

        setIfExist(data, 'videoUrl', videoUrl)
        setIfExist(data, 'caption', caption)

        const url = localStorage.getItem(SERVER_URL)
        if(!url) {
            alert('server url is empty!')
            return
        }

        const fetchData = {
            headers,
            method: 'POST',
            body: JSON.stringify(data),
            //mode: 'no-cors'
        }
        const response = await fetch(`${url}/file`, fetchData)
        console.log('response => ', response)

        if(response.status === 200) {
            setItems(items.filter((item, index) => index !== selectedItem.index))
            selectItem(null)
        } else {
            const text = await response.text()
            alert(`
                Ошибка.
                Статус: ${response.status}. ${response.statusText}
                Текст: "${text}"
            `)
        }
    }

    function instagramDownloadContent(el) {
        const elClass = el.target.className;

        let data;
        switch (elClass) {
            case 'fXIG0': {
                const parent = el.target.parentElement
                const video = parent.getElementsByClassName('tWeCl').item(0)

                data = {
                    type: ContentType.Video,
                    coverImage: video.getAttribute('poster'),
                    videoUrl: video.getAttribute('src')
                }

                break;
            }
            case '_9AhH0': {
                const parent = el.target.parentElement
                const image = parent.getElementsByClassName('FFVAD').item(0)

                data = {
                    type: ContentType.Photo,
                    coverImage: image.getAttribute('src')
                }

                break;
            }
            case 'B20bj': {
                const parent = document.getElementsByClassName('qbCDp').item(0);

                const video = parent
                    .getElementsByTagName('video')
                    .item(0)

                const image =  parent
                    .getElementsByTagName('img')
                    .item(0)

                data = {
                    type: ContentType.Story,
                    coverImage: image.getAttribute('src')
                }

                if(video) {
                    const videoSource = video.getElementsByTagName('source').item(0)
                    data.videoUrl = videoSource.getAttribute('src')
                }

                break
            }
        }

        if(data) setItems(prevItems => [...prevItems, data])
    }

    useEffect(() => {
        window.addEventListener('dblclick', instagramDownloadContent)

        return () => window.removeEventListener('dblclick', instagramDownloadContent)
    }, [])

    useEffect(() => {
        localStorage.setItem('instagram-publisher-items', JSON.stringify(items))
    }, [items])

    return (
        <div className={style.app}>
            {
                selectedItem
                    ? <div className={style.selectedItem}>
                        <div className={style.control}>
                            <img
                                src={getLocalFile('long-arrow-alt-left-solid.svg')}
                                width={'45'}
                                height={'45'}
                                onClick={() => selectItem(null)}
                            />
                            <img
                                src={getLocalFile('trash-alt-regular.svg')}
                                width={'30'}
                                height={'30'}
                                onClick={() => {
                                    setItems(oldItems => oldItems.filter((i, index) => index !== selectedItem.index))
                                    selectItem(null)
                                }}
                            />
                        </div>

                        <div className={style.content}>
                            <img src={selectedItem.coverImage} width={'250'} height={'250'} alt={'image'}/>

                            <textarea
                                placeholder={'Введите подпись'}
                                value={caption}
                                onChange={(e) => setCation(e.target.value)}
                            />

                            <div className={style.date}>
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <TimePicker
                                        clearable
                                        ampm={false}
                                        value={selectedDate}
                                        onChange={handleDateChange}
                                    />

                                    <DatePicker
                                        disableToolbar
                                        variant="inline"
                                        value={selectedDate}
                                        onChange={handleDateChange}
                                    />
                                </MuiPickersUtilsProvider>
                            </div>

                            <button onClick={send}>
                                Отправить
                            </button>
                        </div>
                    </div>
                    : items.map((item, index) => {
                        return (
                            <div key={index} className={style.item} onClick={() => selectItem({ ...item, index })}>
                                <img src={item.coverImage} width={'40'} height={'40'} alt={'pre-image'}/>
                                <span className={style.type}>{item.type.toUpperCase()}</span>
                            </div>
                        )
                    })
            }
        </div>
    )
}
