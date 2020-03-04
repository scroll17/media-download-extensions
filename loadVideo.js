function instagramDownloadContent() {
    const openInNewWindow = false; // TODO

    const locationPathname = document.location.pathname

    function createLinkAndClick(src) {
        const link = document.createElement('a');
        link.setAttribute('target', "__blank");

        if (openInNewWindow) {
            link.setAttribute('href', src);
            link.click();
        } else {
            createDownloadAttribute(src, link).then((link) => link.click());
        }
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

    const createVideoUrl = (url) => `https://www.instagram.com/graphql/query/?query_hash=870ea3e846839a3b6a8cd9cd7e42290c&variables=%7B%22shortcode%22%3A%22${url}%22%2C%22child_comment_count%22%3A3%2C%22fetch_comment_count%22%3A40%2C%22parent_comment_count%22%3A24%2C%22has_threaded_comments%22%3Atrue%7D`;

    if (locationPathname.startsWith('/stories')) {
        const story = document.getElementsByClassName('y-yJ5 OFkrO')[0].getElementsByTagName("source")[0];

        createLinkAndClick(story.src);
    }

    if (locationPathname.startsWith('/p')) {
        const videoLocationPathname = document.location.pathname.match(/\/p\/(.*)\//)[1];

        const url = createVideoUrl(videoLocationPathname);

        getResponseObject(url)
            .then(src => createLinkAndClick(src));
    }
}

window.addEventListener('dblclick', instagramDownloadContent)
