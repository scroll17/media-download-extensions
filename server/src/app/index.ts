/*external modules*/
import express from 'express';
import _ from 'lodash'
/*middlewares*/
/*DB*/
import {FileType} from "../db/types/file";
import {checkAccess} from "./middlewares/checkAccess";
/*models*/
/*other*/

interface IReqBody {
    time: Date,
    imgUrl: string;
    videoUrl?: string;
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
            const requiredKeys: Array<keyof IReqBody> = ['time', "imgUrl", "type"];

            for (let key of requiredKeys) {
                if(_.isNil(req.body[key])) {
                    return res.status(400).send(`"${key}" required`)
                }

                req.body.time = new Date(req.body.time);

                if([FileType.Story, FileType.Video].includes(req.body.type)) {
                    if(_.isNil(req.body.videoUrl)) {
                        return res.status(400).send(`"videoUrl" required`)
                    }
                }
            }

            return next()
        },
        async (req, res, next) => {
            switch (req.body.type) {
                default: {
                    return res.status(400).send('Invalid status')
                }
            }
        }
    )

    app.listen(PORT, () => console.log(`Server start on http://localhost:${PORT}`))
}