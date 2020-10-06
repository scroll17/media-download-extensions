import http from 'http';
import { IgApiClient } from 'instagram-private-api'
import { setEnv } from "./env";
import {Auth} from "./instagram/Auth";
import {Content} from "./instagram/Content";
import { promises as fs } from 'fs'


// const ig = new IgApiClient();
//
// (async () => {
//    const server = http.createServer((req, res) => {});
//    server.listen(3001, () => console.log(`SERVER RUN ON ${3001} PORT`));
//
//    await setEnv();
//
//    /** instagram api */
//    await Auth.login(ig);
//
//    await Content.Publish.story('1600595339720.mp4', ig, { transcodeDelay: 1000 })
// })()