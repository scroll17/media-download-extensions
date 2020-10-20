import React from 'react';
import style from './App.module.sass';
import { Main } from "./components/Main/Main";

import {getLocalFile} from "./utils/getLocalFile";

class App extends React.Component{
    constructor(args) {
        super(args);

        this.state = {
            enable: false
        }

        this.listener = () => {
            this.setState(state => ({ enable: !state.enable }))
        }
    }

    render() {
        const { enable } = this.state;

        return (
            <div className={enable ? style.appEnable : style.appDisable} onClick={enable ? () => {} : this.listener}>
                {
                    enable
                        ? <>
                            <div className={style.main}>
                                <Main />
                            </div>
                            <div className={style.action}>
                                <img src={getLocalFile('power-off-solid.svg')} width={'30'} height={'30'} onClick={this.listener}/>
                            </div>
                          </>
                        : <img src={getLocalFile('icon.png')} width='50' height='50' alt={'icon'}/>
                }
            </div>
        )
    }
}

export default App;
