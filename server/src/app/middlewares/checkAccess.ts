/*external modules*/
import { RequestHandler } from 'express';
import _ from 'lodash'
/*DB*/
import {mainDB} from "../../db";
/*models*/
import {UserModel} from "../../db/models/user";
/*other*/

export const checkAccess: RequestHandler = async (req, res, next) => {
    // TODO
    // if(req.get('host') !== 'instagram') {
    //     return res.sendStatus(403)
    // }

    const secretToken = req.get('x-client-token');
    const userId = req.get('x-user-id');

    if(_.isNil(secretToken) || _.isNil(userId)) {
        return res.sendStatus(403)
    }

    const user = await UserModel.findById.exec(
        mainDB,
        {
            userId: Number(userId)
        }
    )
    if(!user) {
        return res.status(404).send("User")
    }

    if(!user.tokenId) {
        return res.status(400).send('You not have token.')
    }

    const token = await UserModel.getToken.exec(
        mainDB,
        {
            userId: user.id
        }
    )
    if(!token) {
        return res.status(404).send("Token")
    }

    if(!_.isEqual(token.data, secretToken)) {
        return res.status(403).send("Invalid token")
    }

    res.send("OK!")
    next()
}