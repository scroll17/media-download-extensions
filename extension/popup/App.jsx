import React, { useState } from 'react';

function exec(code) {
    return new Promise(resolve => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.executeScript(
                tabs[0].id,
                {
                    code: code
                },
                result => {
                    resolve(result)
                }
            )
        })
    })
}

async function setLocalItems(object) {
    for (const [key, value] of Object.entries(object)) {
        await exec(`localStorage.setItem('${key}', '${value}')`)
    }
}

async function removeLocalItems(items) {
    await Promise.all(items.map(item => exec(`localStorage.removeItem('${item}')`)))
}

const SERVER_URL = 'instagram-publisher-server-url'
const DATA_ID = 'instagram-publisher-data-id'
const DATA_TOKEN = 'instagram-publisher-data-token'

export function App() {
    const [enable, changeEnable] = useState(false)
    const [serverUrl, setServerUrl] = useState(localStorage.getItem(SERVER_URL) ?? '')
    const [dataId, setDataId] = useState(localStorage.getItem(DATA_ID) ?? '')
    const [dataToken, setDataToken] = useState(localStorage.getItem(DATA_TOKEN) ?? '')

    const save = (itemName, clearFunction) => {
        return async (e) => {
            const value = e.target.value

            localStorage.setItem(itemName, value);

            await setLocalItems({ [itemName]: value })

            return clearFunction(value)
        }
    }

    const clearAll = async () => {
        await removeLocalItems([SERVER_URL, DATA_ID, DATA_TOKEN])

        setServerUrl('')
        setDataId('')
        setDataToken('')
    }

    return (
        <>
            { enable &&
                <form onSubmit={e => e.preventDefault()}>
                    <label>
                        Server url:
                        <input type="text" value={serverUrl} onChange={save(SERVER_URL, setServerUrl)} />
                    </label>
                    <label>
                        User ID:
                        <input type="text" value={dataId} onChange={save(DATA_ID, setDataId)} />
                    </label>
                    <label>
                        Token:
                        <input type="text" value={dataToken} onChange={save(DATA_TOKEN, setDataToken)} />
                    </label>
                    <button onClick={clearAll}>
                        Очистить все данные
                    </button>
                </form>
            }
            <button id="control-button" onClick={() => changeEnable(enable => !enable)}>
                {enable ? 'Скрыть' : 'Настройки'}
            </button>
        </>
    )
}
