/*external modules*/
import express from 'express';
import _ from 'lodash'
/*middlewares*/
import {checkAccess} from "./middlewares/checkAccess";
/*DB*/
import {FileType} from "../db/types/file";
import {mainDB} from "../db";
/*models*/
import {JobModel} from "../db/models/job";
/*other*/

interface IReqBody {
    time: Date,
    imgUrl: string;
    videoUrl?: string;
    caption?: string;
    type: FileType;
}

export async function setup() {
    const app = express();

    const PORT = process.env.PORT ?? 5000;
    app.locals.port = PORT;

    app.use(express.json())
    app.use(checkAccess)

    app.post<object, any, IReqBody>('/file',
        (req, res, next) => {
            const requiredKeys: Array<keyof IReqBody> = ['time', 'imgUrl', 'type'];

            for (let key of requiredKeys) {
                if(_.isNil(req.body[key])) {
                    return res.status(400).send(`"${key}" required`)
                }

                switch (req.body.type) {
                    case FileType.Video: {
                        const haveVideoUrl = Boolean(req.body.videoUrl);
                        if(!haveVideoUrl) {
                            return res.status(400).send(`"videoUrl" required`)
                        }

                        break;
                    }
                    default: {
                        return res.status(400).send(`invalid type`)
                    }
                }

                req.body.time = new Date(req.body.time);
                if(req.body.time.valueOf() < Date.now()) {
                    return res.status(400).send(`Cannot publish in back time.`)
                }
            }

            return next()
        },
        async (req, res, next) => {
            const {
                type,
                time,
                caption,
                imgUrl,
                videoUrl
            } = req.body;

            const delayedToPublish = time.valueOf() - Date.now();

            await JobModel.create.exec(
                mainDB,
                {
                    name: "download-file",
                    data: {
                        type: type,
                        delayed: delayedToPublish,
                        caption,
                        imgUrl,
                        videoUrl
                    }
                }
            )

            return res.send('OK')
        }
    )

    app.listen(PORT, () => console.log(`Server start on http://localhost:${PORT}`))
}