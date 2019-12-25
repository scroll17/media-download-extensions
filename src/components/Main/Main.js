import React , { Component } from 'react';
import style from './Main.module.sass';

import { main } from '../../Structure/index';

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

    render(){
        const { path } = this.props;
        return(
            <div className={style.app}>
                path: {path}
                <div>
                    {this.structureParser(main)}
                </div>
            </div>
        )
    }
}

export default Main;
