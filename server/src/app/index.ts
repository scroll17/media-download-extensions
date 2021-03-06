/*external modules*/
import express from 'express';
import _ from 'lodash'
import moment, {Moment} from 'moment'
/*middlewares*/
import {checkAccess} from "./middlewares/checkAccess";
import {cors} from "./middlewares/cors";
/*DB*/
import {FileType} from "../db/types/file";
import {mainDB} from "../db";
/*models*/
import {JobModel} from "../db/models/job";
/*other*/
import { Constants } from "../constants";
import {logger} from "../logger";

interface IReqBody {
    desiredTime: Moment,
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
    app.use(cors)
    app.get('/test', (req, res) => res.sendStatus(200))

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

                req.body.desiredTime = moment(req.body.desiredTime, Constants.LocalTime);
                if(req.body.desiredTime.valueOf() < Date.now()) {
                    return res.status(400).send(`Cannot publish in back time.`)
                }
            }

            return next()
        },
        async (req, res, next) => {
            await JobModel.create.exec(
                mainDB,
                {
                    name: "download-file",
                    data: {
                        ...req.body,
                        desiredTime: moment(req.body.desiredTime).format(Constants.DBDateTime)
                    }
                }
            )

            return res.send('OK')
        }
    )

    app.listen(PORT, () => logger.debug(`Server start on http://localhost:${PORT}`))
}