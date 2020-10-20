import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';

import {getStyleFile} from "./utils/getStyleFile";
// import * as serviceWorker from './serviceWorker';

let root_extension = document.getElementById('root_extension');
if(!root_extension) {
    const style = document.createElement('link');
    style.setAttribute('href', getStyleFile('main'))
    style.setAttribute('rel', 'stylesheet')
    style.setAttribute('id', 'style_root_extension')
    document.body.appendChild(style);

    root_extension = document.createElement('div')
    root_extension.setAttribute('id', 'root_extension');
    document.body.appendChild(root_extension)
}

root_extension.style.zIndex = '9999'

ReactDOM.render(<App />, root_extension)

// serviceWorker.unregister();
