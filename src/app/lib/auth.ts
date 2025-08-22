import { verifyAccessToken } from './jwt';

export const isUserVerificationForAdministrator = (token: string | null): boolean => {
    if (!token) return false;
    try {
        const payload = verifyAccessToken(token);
        return payload.roleId === 1;
    } catch (error) {
        return false;
    }
};

export const getUserRole = (token: string): number | null => {
    try {
        const payload = verifyAccessToken(token);
        return payload.roleId;
    } catch (error) {
        return null;
    }
};

export const getUserFromToken = (token: string) => {
    try {
        return verifyAccessToken(token);
    } catch (error) {
        return null;
    }
};