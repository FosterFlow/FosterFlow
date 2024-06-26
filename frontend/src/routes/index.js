import React, { Suspense } from 'react';
import { 
    Routes as SwitchRoute,
    Route, 
    Navigate, 
    useLocation, 
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    authProtectedRoutes, 
    authRoutes, 
    publicRoutes 
} from './routes';
import { connect } from "react-redux";
import NonAuthLayout from "../layouts/NonAuth";
import AuthLayout from "../layouts/AuthLayout";

/**
 * Main Route component
 */
const Routes = (props) => {
    const { t } = useTranslation();
    const location = useLocation();
    const {
        isAuthenticated,
        confirmEmailSuccess
    } = props;
    
    const emailVerifyPattern = /\/email-verify\/([^/]+)/;
    const emailVerifyTokenPattern = /\/email-verify-token\/([^/]+)/;
    const matchEmailVerifyPattern = location.pathname.match(emailVerifyPattern);
    const matchEmailVerifyTokenPattern = location.pathname.match(emailVerifyTokenPattern);
    const normalizePath = (path) => {
        return path.endsWith('/') ? path.slice(0, -1) : path;
    };
    const normalizedPathname = normalizePath(location.pathname);
    const isAuthRoute = authRoutes.some(route => matchRoute(route.path, normalizedPathname));
    const isAuthProtectedRoute = authProtectedRoutes.some(route => matchRoute(route.path, normalizedPathname));


    /**
     * TODO: check if build-in React methods can do the same 
     *  
     * @param {String} routePattern 
     * @param {String} url 
     * @returns 
     */
    function matchRoute (routePattern, url) {
        const routeParts = routePattern.split('/');
        const urlParts = url.split('/');
      
        if (routeParts.length !== urlParts.length) {
            return false;
        }
      
        for (let i = 0; i < routeParts.length; i++) {
            const routePart = routeParts[i];
            const urlPart = urlParts[i];
        
            if (routePart.startsWith(':')) {
                continue; // this is a dynamic part of the route, so we don't check it
            }
        
            if (routePart !== urlPart) {
                return false; // static parts of the route don't match
            }
        }
      
        return true;
    };

    // Direct Redirection from Root based on Authentication Status
    if (normalizedPathname === '/' || normalizedPathname === '') {
        return <Navigate to={{ pathname:isAuthenticated ? '/chats' : '/login', state: { from: location }}} />;
    }

    //Email verification
    if (matchEmailVerifyPattern) {
        const token = matchEmailVerifyPattern[1];
        if (isAuthenticated) {
            return <Navigate to={{ pathname: `/chats/email-verify-token/${token}`, state: { from: location } }} />;
        }
     
        return <Navigate to={{ pathname: `/login/email-verify-token/${token}`, state: { from: location } }} />;
    }

    //After successfull email validation
    if (matchEmailVerifyTokenPattern && confirmEmailSuccess) {
        if (isAuthenticated) {
            return <Navigate to={{ pathname: `/chats`, state: { from: location } }} />;
        }
        return <Navigate to={{ pathname: `/login`, state: { from: location } }} />;
    }

    //Redirect in case if user not authenticated and tried to reach protected route
    if (!isAuthenticated && isAuthProtectedRoute) {
        return <Navigate to={{ pathname: "/login", state: { from: location } }} />;
    }

    //Redirect in case if user is authenticated and tried to reach auth route like login or register
    if (isAuthenticated && isAuthRoute) {
        return <Navigate to={{ pathname: "/chats", state: { from: location } }} />;
    }

    return (
        // rendering the router with layout
        <React.Fragment>
            <Suspense fallback={
                <div className='p-3'>
                    {t('Loading dependencies')}...
                </div>} >
                <SwitchRoute>
                    {/* public routes */}
                    {authRoutes.map((route, idx) =>
                        <Route 
                            path={route.path} 
                            layout={NonAuthLayout} 
                            element={<NonAuthLayout>{route.component}</NonAuthLayout>}
                            key={idx} 
                        />
                    )}

                    {/* private/auth protected routes */}
                    {authProtectedRoutes.map((route, idx) =>
                        <Route 
                            path={route.path} 
                            layout={AuthLayout} 
                            element={<AuthLayout>{route.component}</AuthLayout>}
                            key={idx} 
                        />
                    )}

                    {/* public routes */}
                    {publicRoutes.map((route, idx) =>
                        <Route 
                            path={route.path} 
                            layout={AuthLayout} 
                            element={<NonAuthLayout>{route.component}</NonAuthLayout>}
                            key={idx} 
                        />
                    )}
                </SwitchRoute>
            </Suspense>
        </React.Fragment>
    );
}

const mapStateToProps = (state) => {
    const {
        isAuthenticated,
        confirmEmailSuccess
    } = state.Auth;

    return {
        //cause re-render of the router if user was authenticated or logout
        isAuthenticated,
        confirmEmailSuccess
    }
};

export default connect(mapStateToProps)(Routes);