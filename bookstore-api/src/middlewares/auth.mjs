import passport from 'passport'
import ApiError from '../utils/ApiError.mjs'
import httpStatus from 'http-status'
import {ROLES} from '../constants/index.mjs'


export const isLoggedIn = (req, res, next) => {
    passport.authenticate('jwt', {session: false}, (err, user, info) => {
        if (err || info || !user) {
            next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'))
        }

        req.user = user;
        next();
    })(req, res, next);
};

export const isAdmin = (req, res, next) => {
    if (!req.user?.role) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please Authenticate');
    }
    if (req.user.role !== ROLES.ADMIN) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to perform this action. Admin privileges required.');
    }
    next();
}

export const isOrderManagerOrAdmin = (req, res, next) => {
    if (!req.user?.role) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please Authenticate');
    }
    if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.ORDER_MANAGER) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to perform this action.');
    }
    next();
}

