const createVideoUrl = (url) => `https://www.instagram.com/graphql/query/?query_hash=870ea3e846839a3b6a8cd9cd7e42290c&variables=%7B%22shortcode%22%3A%22${url}%22%2C%22child_comment_count%22%3A3%2C%22fetch_comment_count%22%3A40%2C%22parent_comment_count%22%3A24%2C%22has_threaded_comments%22%3Atrue%7D`;

function createLinkAndClick(src, openInNewWindow) {
    const link = document.createElement('a');
    link.setAttribute('target', "__blank");

    if (openInNewWindow) {
        link.setAttribute('href', src);
        link.click();
    } else {
        createDownloadAttribute(src, link).then(link => link.click());
    }
}

function getResponseObject(url) {
    return fetch(url)
        .then(response => {
            if (response.ok) {
                return response
            } else {
                const error = new Error(response.statusText)
                error.response = response
                throw error
            }
        })
        .then(response => response.json())
        .then(responseObject => responseObject.data.shortcode_media.video_url)
}

function createDownloadAttribute(src, element) {
    return fetch(src)
        .then(response => {
            if (response.ok) {
                return response
            } else {
                const error = new Error(response.statusText)
                error.response = response
                throw error
            }
        })
        .then(response => response.blob())
        .then(blob => {
            const objectURL = URL.createObjectURL(blob);

            element.setAttribute('href', objectURL);
            element.setAttribute('download', Date.now());

            return element
        })
}

function getStoryElement() {
    return document.getElementsByClassName('y-yJ5 OFkrO')[0].getElementsByTagName("source")[0]
}

function instagramDownloadContent(data) {
    const openInNewWindow = data.openInNewWindow;
    const locationPathname = document.location.pathname

    if (locationPathname.startsWith('/stories')) {
        const story = getStoryElement();
        createLinkAndClick(story.src, openInNewWindow);
    }

    if (locationPathname.startsWith('/p')) {
        const videoLocationPathname = document.location.pathname.match(/\/p\/(.*)\//)[1];

        const url = createVideoUrl(videoLocationPathname);
        // getResponseObject(url) // TODO need this
        getResponseObject(url).then(src => createLinkAndClick(src));
    }
}

window.addEventListener("load", function() {
    if(!document.location.href.includes('www.instagram.com')) return

    let mediaDownloadExtensionConfig;
    if(localStorage.getItem('media-download-extension')){
        mediaDownloadExtensionConfig = JSON.parse(
            localStorage.getItem('media-download-extension')
        );
    }

    let answer;
    if(mediaDownloadExtensionConfig){
        console.log('mediaDownloadExtension', mediaDownloadExtensionConfig)
        if(mediaDownloadExtensionConfig.openInNewWindow){
            answer = prompt('Open in new window ? (yes or no)', 'no')
            localStorage.setItem('media-download-extension', JSON.stringify({
                openInNewWindow: answer === 'yes' ? (answer = true) : (answer = false)
            }))
        }
    } else {
        answer = prompt('Open in new window ? (yes or no)', 'no')
        localStorage.setItem('media-download-extension', JSON.stringify({
            openInNewWindow: answer === 'yes' ? (answer = true) : (answer = false)
        }))
    }

    window.addEventListener('dblclick', instagramDownloadContent.bind(undefined, {
        openInNewWindow: answer
    }))
}, true);

//
// chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
//     switch(message.type) {
//         case 'dom-type':
//             alert('case');
//             chrome.extension.sendMessage({
//                 load: document.readyState === "complete"
//             });
//             break;
//         case 'instagram-start':
//             let func = bindedFunction.instagramDownloadContent = instagramDownloadContent.bind(undefined, message.data)
//             window.addEventListener('dblclick', instagramDownloadContent);
//             break;
//         case 'instagram-stop':
//             window.removeEventListener('dblclick', bindedFunction.instagramDownloadContent);
//             break;
//     }
// });