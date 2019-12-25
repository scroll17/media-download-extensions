import React , { Component } from 'react';
import style from './App.module.sass';

import Login from './components/Login/Login';

class App extends Component{
    state = {
        login: false,
        path: []
    }

    setLogin(isLogined){
        this.setState({
            login: isLogined
        })
    }

    render(){
        const { login } = this.state;
        return(
            <div className={style.app}>
                {
                    login ?
                    <div>logined</div> :
                    <Login setLogin={(isLogined) => this.setLogin(isLogined)}/>
                }
            </div>
        )
    }
}

export default App;
