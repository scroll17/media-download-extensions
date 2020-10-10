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
    desiredTime: Date,
    imgUrl: string;
    videoUrl?: string;
    caption?: string;
    type: FileType;
    userId: string;
}

export async function setup() {
    const app = express();

    const PORT = process.env.PORT ?? 5000;
    app.locals.port = PORT;

    app.use(express.json())
    app.use(checkAccess)

    app.post<object, any, IReqBody>('/file',
        (req, res, next) => {
            const requiredKeys: Array<keyof IReqBody> = ['desiredTime', 'imgUrl', 'type'];

            for (let key of requiredKeys) {
                if(_.isNil(req.body[key])) {
                    return res.status(400).send(`"${key}" required`)
                }

                const isValidType = Object.values(FileType).some(type => type === req.body.type);
                if(!isValidType) {
                    return res.status(400).send(`invalid type`)
                }

                if(req.body.type === FileType.Video && !req.body.videoUrl) {
                    return res.status(400).send(`"videoUrl" required`)
                }

                req.body.desiredTime = new Date(req.body.desiredTime);
                // TODO _
                // if(req.body.desiredTime.valueOf() < Date.now()) {
                //     return res.status(400).send(`Cannot publish in back time.`)
                // }
            }

            return next()
        },
        async (req, res, next) => {
            await JobModel.create.exec(
                mainDB,
                {
                    name: "download-file",
                    data: req.body
                }
            )

            return res.send('OK')
        }
    )

    app.listen(PORT, () => console.log(`Server start on http://localhost:${PORT}`))
}