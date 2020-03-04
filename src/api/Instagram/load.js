export default function () {
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        if(request.type){

        }
        return true;
    });
}