import Head from 'next/head'
import Link from 'next/link'
import NProgress from 'nprogress'
import Router from 'next/router'
import 'nprogress/nprogress.css'
import React from 'react'

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