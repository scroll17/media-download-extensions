import React from 'react';
import style from './App.module.sass';
import { Main } from "./components/Main/Main";

import {getLocalFile} from "./utils/getLocalFile";

class App extends React.Component{
    constructor(args) {
        super(args);

        this.state = {
            enable: false,
            userId: '',
            token: '',
            saved: false
        }

        const loginData = localStorage.getItem('instagram-publisher-data')
        if(loginData) {
            const { userId, token } = JSON.parse(loginData)
            this.state = {
                ...this.state,
                userId,
                token,
                saved: true
            }
        }

        this.listener = () => {
            this.setState(state => ({ enable: !state.enable }))
        }

        this.handleChangeUserId = (event) => {
            this.setState({ userId: event.target.value });
        }
        this.handleChangeToken = (event) => {
            this.setState({ token: event.target.value });
        }

        this.save = () => {
            if(!this.state.userId || !this.state.token) return

            const { userId, token } = this.state
            const data = JSON.stringify({ userId, token })
            localStorage.setItem('instagram-publisher-data', data)

            this.setState({ saved: true })
        }
    }

    render() {
        const { enable, token, userId, saved } = this.state;

        const enableContent = (
            <>
                <div className={style.main}>
                    {
                        (token && userId && saved)
                            ? <Main token={token} userId={userId}/>
                            : (
                                <form className={style.form} onSubmit={e => e.preventDefault()}>
                                    <label>
                                        User ID:
                                        <input type="text" value={this.state.userId} onChange={this.handleChangeUserId} />
                                    </label>
                                    <label>
                                        Token:
                                        <input type="text" value={this.state.token} onChange={this.handleChangeToken} />
                                    </label>
                                    <button onClick={this.save}>
                                        Save
                                    </button>
                                </form>
                            )
                    }
                </div>
                <div className={style.action}>
                    <img src={getLocalFile('power-off-solid.svg')} width={'30'} height={'30'} onClick={this.listener}/>
                </div>
            </>
        )

        return (
            <div className={enable ? style.appEnable : style.appDisable} onClick={enable ? () => {} : this.listener}>
                {
                    enable
                        ? enableContent
                        : <img src={getLocalFile('icon.png')} width='50' height='50' alt={'icon'}/>
                }
            </div>
        )
    }

    // componentDidUpdate(prevProps, prevState, snapshot) {
    //     console.log('---- componentDidUpdate ---')
    //
    //     if(prevState.enable !== this.state.enable) {
    //         if(prevState.enable === false) {
    //             console.log('---- remove listener ---')
    //             window.removeEventListener('dblclick', this.state.listener)
    //         }
    //
    //         if(prevState.enable === true) {
    //             console.log('---- add listener ---')
    //             window.addEventListener('dblclick', this.state.listener)
    //         }
    //     }
    // }
    //
    // componentDidMount() {
    //     console.log('---- componentDidMount ---')
    //
    //     if(this.state.enable === false && !this.state.listener) {
    //         console.log('---- add listener ---')
    //
    //         window.addEventListener('dblclick', instagramDownloadContent)
    //         this.setState({ listener: instagramDownloadContent })
    //     }
    // }
}

export default App;
