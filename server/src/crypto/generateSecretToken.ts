/*external modules*/
import crypto from 'crypto'
/*other*/

export function generateSecretToken() {
    return crypto
        .randomBytes(36)
        .toString('base64')
}