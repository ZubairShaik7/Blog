import Layout from '../components/Layout'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { showSuccessMessage, showErrorMessage } from '../helpers/alerts'
import { API } from '../config'
import Link from 'next/link'
import Router from 'next/router'
import { authenticate, isAuth } from '../helpers/auth'

const Login = () => {

    const [state, setState] = useState({
        email: 'ryan@gmail.com',
        password: 'nibbysrus',
        error: '',
        success: '',
        buttonText: 'Login'
    })

    useEffect(() => {
        isAuth() && Router.push('/')
    }, [])

    const { email, password, error, success, buttonText } = state

    const handleChange = (name) => (e) => {
        setState({ ...state, [name]: e.target.value, error: '', success: '', buttonText: 'Login' })
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setState({...state, buttonText: 'Logging In'})
        try {
            const response = await axios.post(`http://localhost:8000/api/login`, {
                email,
                password
            })
            console.log(response)
            authenticate(response, () => {
                if (isAuth() && isAuth().role == 'admin') {
                    return Router.push('/admin')
                } else {
                    return Router.push('/user')
                }
            })
        } catch (error) {
            setState({...state, buttonText: 'Login', error: error.response.data.error})
        }
    }

    const loginForm = () => {
        return (
            <form onSubmit={handleSubmit}>
                <div className='form-group'>
                    <input value={email} onChange={handleChange('email')} type='email' className='form-control' placeholder='Type your email' required/>
                </div>
                <div className='form-group'>
                    <input value={password} onChange={handleChange('password')} type='password' className='form-control' placeholder='Type your password' required/>
                </div>
                <div className='form-group'>
                    <button className='btn btn-outline-warning'> {buttonText} </button>
                </div>
            </form>
        )
    }

    return (
        <Layout>
            <div className='col-md-6 offset-md-3'>
                <h1> Login </h1>
                <br />
                {success && showSuccessMessage(success)}
                {error && showErrorMessage(error)}
                {loginForm()}
            </div>

        </Layout>
    )
}

export default Login;