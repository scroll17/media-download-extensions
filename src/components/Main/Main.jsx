import React , { Component } from 'react';
import style from './Main.module.sass';

import { main } from '../../structure/index.js';

import Instagram from '../ControlComponents/Instagram/Instagram.jsx'

class Main extends Component{

    structureParser(structure){
        const result = [];
        const { setPath } = this.props;
        structure.forEach(item => {
            const { title, path, gradient } = item;
            result.push(
                <li 
                    onClick={() => setPath(path)}
                    style={gradient ? {background: `linear-gradient(${gradient})`} : ''}
                    className={style.item}
                >
                    <i className="fab fa-instagram"/>
                    <span>
                        {title}
                    </span>
                </li>
            )
        });

        return (
            <ul className={style.list}>
                {result}
            </ul>
        )
    }

    switch(originPath){
        const path = originPath.slice(1);
        switch(path){
            case 'instagram': {
                return <Instagram />
            }
        }
    }

    render(){
        const { path, clearPath } = this.props;
        console.log('path === ', path)
        return(
            <div className={style.app}>
                <div>
                    {
                     path && <i 
                        className="far fa-arrow-alt-circle-left" 
                        style={{marginLeft: '12px', cursor: 'pointer'}}
                        onClick={() => clearPath()}
                     />
                    }
                    {!path && this.structureParser(main)}
                </div>
                {
                    path && (
                        <div>
                            {this.switch(path)}
                        </div>
                    )
                }
            </div>
        )
    }
}

export default Main;
