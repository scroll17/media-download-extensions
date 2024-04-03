export function getLocalFile(file, dirName = 'images') {
    return `chrome-extension://kfkehggpbhceoakoohilbpcibffmafcd/${dirName}/${file}`
}