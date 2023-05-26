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
export const getCookie = key => {
    if (typeof window) {
        return cookie.get(key)
    }
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