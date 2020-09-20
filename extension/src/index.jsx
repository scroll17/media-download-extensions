import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.jsx';
import * as serviceWorker from './serviceWorker';

let root = document.getElementById('root');
if(!root){
    root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.appendChild(root)
}

ReactDOM.render(<App />, root);

serviceWorker.unregister();
