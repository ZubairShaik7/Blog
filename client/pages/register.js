import Layout from '../components/Layout'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { showSuccessMessage, showErrorMessage } from '../helpers/alerts'
import { isAuth } from '../helpers/auth'
import Router from 'next/router'

const Register = () => {

    const [state, setState] = useState({
        name: 'Ryan',
        email: 'ryan@gmail.com',
        password: 'nibbysrus',
        error: '',
        success: '',
        buttonText: 'Register',
        loadedCategoires: [],
        categories: []
    })

    const { name, email, password, error, success, buttonText, loadedCategoires, categories } = state

    const loadCategories = async () => {
        const response = await axios.get(`http://localhost:8000/api/categories`)
        setState({...state, loadedCategories: response.data})
    }

    const handleToggle = (c) => () => {
        const clickedCategory = categories.indexOf(c)
        const all = [...categories]
        if (clickedCategory == -1) {
            all.push(c)
        } else {
            all.splice(clickedCategory, 1)
        }
        console.log('all >> categories', all)
        setState({...state, categories: all, success: '', error: ''})
    }

    const showCategories = () => {
        return loadedCategories && loadedCategories.map((c, i) => {
            return (
                <li className="list-unstyled" key={i}>
                    <input type="checkbox" onChange={handleToggle(c._id)} className="mr-2" />
                    <label className="form-check-label">{c.name}</label>
                </li>
            )
        })
    }
    
    useEffect(() => {
        loadCategories()
    }, [])

    useEffect(() => {
        isAuth() && Router.push('/')
    }, [])

    const handleChange = (name) => (e) => {
        setState({ ...state, [name]: e.target.value, error: '', success: '', buttonText: 'Register' })
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setState({...state, buttonText: 'Registering'})
        try {
            const response = await axios.post(`http://localhost:8000/api/register`, {
                name,
                email,
                password,
                categories
            })
            console.log(response)
            setState({
                ...state,
                name: '',
                email: '',
                password: '',
                buttonText: 'Submitted',
                success: response.data.message
            })
        } catch (error) {
            setState({...state, buttonText: 'Register', error: error.response.data.message})
        }
    }

    const registerForm = () => {
        return (
            <form onSubmit={handleSubmit}>
                <div className='form-group'>
                    <input value={name} onChange={handleChange('name')} type='text' className='form-control' placeholder='Type your name' required/>
                </div>
                <div className='form-group'>
                    <input value={email} onChange={handleChange('email')} type='email' className='form-control' placeholder='Type your email' required/>
                </div>
                <div className='form-group'>
                    <input value={password} onChange={handleChange('password')} type='password' className='form-control' placeholder='Type your password' required/>
                </div>
                <div className="form-group">
                    <label className="text-muted ml-4">Category</label>
                    <ul style={{maxHeight: '100px', overflowY: 'scroll'}}>{showCategories()}</ul>
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
                <h1> Register </h1>
                <br />
                {success && showSuccessMessage(success)}
                {error && showErrorMessage(error)}
                {registerForm()}
            </div>

        </Layout>
    )
}

export default Register;