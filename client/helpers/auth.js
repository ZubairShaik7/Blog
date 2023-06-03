import cookie from 'js-cookie'
import Router from 'next/router'

//set in cookie
export const setCookie = (key, value) => {
    if (typeof window) {
        cookie.set(key, value, {
            expires: 1
        })
    }
}

//remove from cookie
export const removeCookie = (key, value) => {
    if (typeof window) {
        cookie.remove(key)
    }
}

//get from cookie
export const getCookie = (key, req) => {
    return (typeof window) ? getCookieFromBrowser(key) : getCookieFromServer(key, req)
}

export const getCookieFromBrowser = (key) => {
    return cookie.get(key)
}

export const getCookieFromServer = (key, req) => {
    if (!req.headers.cookie) {
        return undefined
    }
    let token = req.headers.cookie.split(';').find(c => c.trim().startsWith(`${key}=`))
    if (!token) {
        return undefined
    }
    let tokenVal = token.split('=')[1]
    return tokenVal
}

//set in localstorage
export const setLocalStorage = (key, value) => {
    if (typeof window) {
        localStorage.setItem(key, JSON.stringify(value))
    }
}

//remove from localstorage
export const removeLocalStorage = (key, value) => {
    if (typeof window) {
        localStorage.removeItem(key)
    }
}

//authenticate user by passing data to cookie and localstorage during signin
export const authenticate = (response, next) => {
    setCookie('token', response.data.token)
    setLocalStorage('user', response.data.user)
    next()
}

//access user info from localstorage
export const isAuth = () => {
    if (typeof window) {
        const cookieChecked = getCookie('token')
        if (cookieChecked) {
            if (localStorage.getItem('user')) {
                return JSON.parse(localStorage.getItem('user'))
            }
        }
    }
}

export const logout = () => {
    removeCookie('token')
    removeLocalStorage('user')
    return Router.push('/login')
}

export const updateUser = (user, next) => {
    if (typeof window) {
        if (localStorage.getItem('user')) {
            let auth = JSON.parse(localStorage.getItem('user'))
            auth = user
            localStorage.setItem('user', JSON.stringify(auth))
            next()
        }
    }
}