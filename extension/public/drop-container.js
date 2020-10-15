(async () => {
    const root_extension = document.getElementById('root_extension');
    const root_style = document.getElementById('style_root_extension');

    if(root_extension) document.body.removeChild(root_extension);
    if(root_style) document.body.removeChild(root_style);
})()