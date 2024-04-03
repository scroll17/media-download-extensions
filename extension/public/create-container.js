const button = document.getElementById('modal');
if(button) {
    button.onclick = function (el) {
        const status = localStorage.getItem('instagram-publisher-status');

        if(status && status === 'on') {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
              chrome
                .scripting
                .executeScript({
                  target: { tabId: tabs[0].id },
                  files: ['./drop-container.js']
                })
                .thne((result) => {
                  localStorage.setItem('instagram-publisher-status', 'off')
                  console.log('result -> ', result)
                })
            })
        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
              chrome
                .scripting
                .executeScript({
                  target: { tabId: tabs[0].id },
                  files: ['./container.js']
                })
                .then((result) => {
                  localStorage.setItem('instagram-publisher-status', 'on')
                  console.log('result -> ', result)
                })
            })
        }
    }
}