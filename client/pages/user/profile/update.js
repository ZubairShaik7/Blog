import Layout from '../../../components/Layout'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { showSuccessMessage, showErrorMessage } from '../../../helpers/alerts'
import { isAuth } from '../../../helpers/auth'
import Router from 'next/router'

const Profile = ({ user, token }) => {
    const [state, setState] = useState({
        name: user.user.name,
        email: user.user.email,
        password: '',
        error: '',
        success: '',
        buttonText: 'Update',
        loadedCategories: [],
        categories: user.user.categories
    })

    const { name, email, password, error, success, buttonText, loadedCategories, categories } = state

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
                    <input type="checkbox" onChange={handleToggle(c._id)} checked={categories.includes(c._id)} className="mr-2" />
                    <label className="form-check-label">{c.name}</label>
                </li>
            )
        })
    }
    
    useEffect(() => {
        loadCategories()
    }, [])

    const handleChange = (name) => (e) => {
        setState({ ...state, [name]: e.target.value, error: '', success: '', buttonText: 'Update' })
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setState({...state, buttonText: 'Updating'})
        try {
            const response = await axios.put(`http://localhost:8000/api/user`, {
                name,
                password,
                categories
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            console.log(response)
            setState({
                ...state,
                buttonText: 'Updated',
                success: 'Profile Updated Successfully'
            })
        } catch (error) {
            setState({...state, buttonText: 'Update', error: error.response.data.message})
        }
    }

    const updateForm = () => {
        return (
            <form onSubmit={handleSubmit}>
                <div className='form-group'>
                    <input value={name} onChange={handleChange('name')} type='text' className='form-control' placeholder='Type your name' required/>
                </div>
                <div className='form-group'>
                    <input value={email} onChange={handleChange('email')} type='email' className='form-control' placeholder='Type your email' required disabled/>
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
                <h1> Update Profile </h1>
                <br />
                {success && showSuccessMessage(success)}
                {error && showErrorMessage(error)}
                {updateForm()}
            </div>

        </Layout>
    )
}

export async function getServerSideProps(context) {
    const token = context.req.cookies.token
    console.log(token)
    let user = null
    if (token) {
        try {
            const response = await axios.get(`http://localhost:8000/api/user`, {
                headers: {
                    authorization: `Bearer ${token}`,
                    contentType: 'application/json'
                }
            })
            user = response.data
        } catch(error) {
            console.log(error.response)
            user = null
        }
    }
    if (user == null) {
        context.res.writeHead(302, {
            Location: '/'
        })
        context.res.end()
    } else {
        return {
            props: {
                user,
                token
            }
        }
    }
}

export default Profile;