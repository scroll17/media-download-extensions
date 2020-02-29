import React, { useState, useLayoutEffect } from 'react';
import style from './Login.module.sass';

import userDefault from '../../images/user-default.png';

function Login(props){
    const { setLogin } = props;
    const [ error, setError ] = useState(false);
    const [ input, setInput ] = useState('');
    
    const inputPassword = (e) => {
        if(error) setError(false);
        return setInput(e.target.value)
    }

    const checkPassword = (isNotLocal = true) => {
        const inputs = input.split(';');
        if( inputs.length < 2 ){
            return setError('Invalid password');
        }

        let bit = 738//~ +inputs[0] << 361 >>> 19 & inputs[1];
        if( bit === 738 ){
            isNotLocal && localStorage.setItem('_x-sad--passord', JSON.stringify(inputs))
            return setLogin(true);
        }else{
            return setError('Invalid password');
        }
    }

    useLayoutEffect(() => {
        const localPassword = JSON.parse(localStorage.getItem('_x-sad--passord'));
        if( Array.isArray(localPassword) ){
            setInput(localPassword.join(';'))
            checkPassword(false);
        }
    });

    return(
        <div className={style.login}>
            <img src={userDefault} alt='user-default.jpg' className={style.icon}/>
            <div className={style.inputBlock}>
                <input 
                    value={input} 
                    onChange={inputPassword}
                    type='password'
                />
                <i 
                    className="far fa-arrow-alt-circle-right" 
                    onClick={checkPassword}
                />
            </div>
            {
                error && <span className={style.error}>{error}</span>
            }
        </div>
    )
}

export default Login;
