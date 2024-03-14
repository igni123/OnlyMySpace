// Use this for development only
// @ts-check
const jose = require('jose');
// Make a jwt
async function a(){
    const secret = new TextEncoder().encode("");
    const alg = 'HS256';
    const jwt = await new jose.SignJWT({ email:"" }).setProtectedHeader({ alg }).setExpirationTime('1d').sign(secret);
    console.log(jwt)
}

a()