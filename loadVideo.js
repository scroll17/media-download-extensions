const createVideoUrl = (url) => `https://www.instagram.com/graphql/query/?query_hash=870ea3e846839a3b6a8cd9cd7e42290c&variables=%7B%22shortcode%22%3A%22${url}%22%2C%22child_comment_count%22%3A3%2C%22fetch_comment_count%22%3A40%2C%22parent_comment_count%22%3A24%2C%22has_threaded_comments%22%3Atrue%7D`;

const createLink = (src) => {
    const link = document.createElement('a');
    link.setAttribute('target', "__blank");
    link.setAttribute('href', src);
    link.setAttribute('download', "download");

    link.click();
};

const getResponseObject = (url) => {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', url, false);
    xhr.send();

    const responseJSON = "" + xhr.responseText + "";

    const responseObject = JSON.parse(responseJSON);

    return responseObject.data.shortcode_media.video_url;
};


function donwloadStory(){
    const video = document.getElementsByClassName('y-yJ5 OFkrO') [0].getElementsByTagName("source")[0];
    createLink(video.src);
};

const donwloadVideo = () => {
    const videoLocationPathname = document.location.pathname.match(/\/p\/(.*)\//)[1];

    const url = createVideoUrl(videoLocationPathname);

    const src = getResponseObject(url);

    createLink(src);
};

window.addEventListener('dblclick', donwloadVideo);
//window.removeEventListener('dblclick', donwloadVideo)

//window.addEventListener('dblclick', donwloadStory);
//window.removeEventListener('dblclick', donwloadStory)
