import { fail, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import * as jose from 'jose';
import { prisma } from '$lib/server/db';

export const load: LayoutServerLoad = async ({ cookies }) => {
    let payload: jose.JWTPayload;
    const jwt = cookies.get('jwt');
    if (!jwt) {
        return redirect(302, '/auth/login');
    }
    try {
        let temp = await jose.jwtVerify(jwt.toString(), new TextEncoder().encode(process.env.JWT_SECRET));
        payload = temp.payload;
        if (payload.exp && payload.exp < Date.now() / 1000) {
            return redirect(302, '/auth/login');
        }
    } catch (e) {
        if (e instanceof jose.errors.JWSSignatureVerificationFailed) {
            cookies.delete('jwt',{
                path: '/',
            });
            return redirect(302, '/auth/login');
        } else {
            return fail(500, {
                "message": "Internal server error"
            })
        }
    }
    if (!payload.email) {
        cookies.delete('jwt',{
            path: '/',
        })
        return redirect(302, '/auth/login');
    }
    // If the user is authenticated query their profile in order to load their saved settings
    const profile = await prisma.userProfile.findFirst({
        where: {
            user: {
                email: payload.email
            }
        }
    })
    if (!profile || !profile.profile) {
        return {
            "newProfile": true,
            profile: null
        }
    }
    return {
        newProfile: false,
        profile: profile?.profile
    }
};