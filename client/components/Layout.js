import Head from 'next/head'
import Link from 'next/link'
import NProgress from 'nprogress'
import Router from 'next/router'
import 'nprogress/nprogress.css'
import React from 'react'
import { isAuth, logout } from '../helpers/auth'

Router.onRouteChangeStart = url => NProgress.start()
Router.onRouteChangeComplete = url => NProgress.done()
Router.onRouteChangeError = url => NProgress.done()


const Layout = ({ children }) => {

    const head = () => {
        return (
        <React.Fragment>
            <link rel="stylesheet" 
            href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" 
            integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" 
            crossOrigin="anonymous"
            />
            <link rel="stylesheet" href='/static/css/styles.css'></link>
        </React.Fragment>
        )
    }

    const nav = () => {
        return (
        <ul className="nav nav-tabs bg-warning">
            <li className="nav-item">
                <Link className="nav-link text-dark" href="/">
                    Home
                </Link>
            </li>
            {
                !isAuth() && (
                    <React.Fragment>
                        <li className="nav-item">
                            <Link className="nav-link text-dark" href="/login">
                                Login
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-dark" href="/register">
                                Register
                            </Link>
                        </li>
                    </React.Fragment>
                )
            }
            {
                isAuth() && isAuth().role == 'admin' && (
                    <li className="nav-item ml-auto">
                        <Link className="nav-link text-dark" href="/admin">
                        {isAuth().name}
                        </Link>
                    </li>
                )
            }
            {
                isAuth() && isAuth().role == 'subscriber' && (
                    <li className="nav-item ml-auto">
                        <Link className="nav-link text-dark" href="/user">
                            {isAuth().name}
                        </Link>
                    </li>
                )
            }
            {
                isAuth() && (
                    <li className="nav-item">
                        <a onClick={logout} className="nav-link text-dark">
                            Logout
                        </a>
                    </li>
                )
            }
        </ul>
        )
    }

    return (
        <React.Fragment>
         {head()} {nav()} <div className='container pt-5 pb-5'>{children}</div>
        </React.Fragment>
    )
}

export default Layout