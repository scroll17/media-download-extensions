const button = document.getElementById('modal');
if(button) {
    button.onclick = function (el) {
        const status = localStorage.getItem('instagram-publisher-status');

        if(status && status === 'on') {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                chrome.tabs.executeScript(
                    tabs[0].id,
                    {
                        file: './drop-container.js'
                    },
                    result => {
                        localStorage.setItem('instagram-publisher-status', 'off')
                        console.log('result -> ', result)
                    }
                )
            })
        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                chrome.tabs.executeScript(
                    tabs[0].id,
                    {
                        file: './container.js'
                    },
                    result => {
                        localStorage.setItem('instagram-publisher-status', 'on')
                        console.log('result -> ', result)
                    }
                )
            })
        }
    }
}