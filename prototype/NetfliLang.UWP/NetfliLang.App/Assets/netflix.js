// function getVideo() {
//     return document.querySelector('video');
// }

// function start() {
//     let prevVideo = document.querySelector('video');
//     setInterval(() => {
//         const nextVideo = getVideo(); 
//         if (prevVideo !== nextVideo) { 
//             prevVideo = nextVideo;
//             if (nextVideo) { 
//                 nextVideo.addEventListener('play', () => {
//                     console.log('play');
//                     window.external.notify('play');
//                 }); 
//                 nextVideo.addEventListener('pause', () => {
//                     console.log('pause');
//                     window.external.notify('pause');
//                 }); 
//             } 
//         } 
//     }, 500);
// }

// start();

function getVideo() {
    return document.querySelector('video');
}

function getTitles() {
    return document.querySelector('.player-timedtext-text-container').innerText;
}

function setTitles(titles) {
    if(!titles) { return; }

    try {
    const translated = titles.split(/[,|.|?|!]+[ |\t|\n|\r]*/).map(s => { return s + ' (' + s + ')'; }).join('\n');
    console.log(translated);
    document.querySelector('.player-timedtext-text-container').innerHTML = '<span style="font-size:34px;line-height:normal;font-weight:normal;color:#ffffff;text-shadow:#000000 0px 0px 7px;font-family:Netflix Sans,Helvetica Nueue,Helvetica,Arial,sans-serif;font-weight:bolder">' + translated + '</span>';
    } catch {}
}

function start() {
    getVideo().playbackRate = 0.7;
    let prevTitles = getTitles();
    setInterval(() => {
        const nextTitles = getTitles(); 
        if (prevTitles !== nextTitles) { 
            prevTitles = nextTitles;
            if (nextTitles) { 
                // getVideo().pause();
                setTitles(nextTitles);
                // setTimeout(() => {
                //     getVideo().play();
                // }, 1500);
            } 
        } 
    }, 500);
}

start();