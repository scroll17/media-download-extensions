import React from 'react';
import style from './App.module.sass';

import Login from './components/Login/Login.jsx';
import Main from './components/Main/Main.jsx';

class App extends React.Component{
    constructor() {
        super();
        this.state = {
            login: true,
            path: []
        }
    }
    setPath(path){
        this.setState({
            path: [path]
        })
    }

    clearPath(){
        this.setState({
            path: []
        })
    }

    render(){
        const { login, path } = this.state;
        return(
            <div className={style.app}>
                {
                    login ?
                    <Main
                        path={path[0]}
                        setPath={(path) => this.setPath(path)}
                        clearPath={this.clearPath.bind(this)}
                    /> :
                    <Login setLogin={(isLogined) => this.setLogin(isLogined)}/>
                }
            </div>
        )
    }
}

export default App;
