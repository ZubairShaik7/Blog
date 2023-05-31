import { useState, useEffect } from "react"
import React from "react"
import Layout from "../../../components/Layout"
import axios from "axios"
import { showSuccessMessage, showErrorMessage } from "../../../helpers/alerts"
import { isAuth } from "../../../helpers/auth"

const Create = ({ user, token }) => {
    const [state, setState] = useState({
        title: '',
        url: '',
        categories: [],
        loadedCategories: [],
        success: '',
        error: '',
        type: '',
        medium: ''
    })
    const { title, url, categories, loadedCategories, success, error, type, medium } = state

    const loadCategories = async () => {
        const response = await axios.get(`http://localhost:8000/api/categories`)
        setState({...state, loadedCategories: response.data})
    }
    
    useEffect(() => {
        loadCategories()
    }, [success])

    const handleURLChange = (e) => {
        setState({...state, url: e.target.value, error: '', success: ''})
    }

    const handleTitleChange = (e) => {
        setState({...state, title: e.target.value, error: '', success: ''})
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post(`http://localhost:8000/api/link`, { title, url, categories, type, medium }, {
                headers: {
                    authorization: `Bearer ${token}`
                }
            })
            setState({
                ...state,
                title: '',
                url: '',
                error: '',
                loadedCategories: [],
                categories: [],
                type: '',
                medium: '',
                success: `Link is created`
            })
        } catch (error) {
            console.log(error)
            setState({...state, error: error.response.data.error})
        }
    }

    const handleTypeClick = (e) => {
        setState({...state, type: e.target.value, error: '', success: ''})
    }

    const handleMediumClick = (e) => {
        setState({...state, medium: e.target.value, error: '', success: ''})
    }

    const showTypes = () => {
        return (
            <React.Fragment>
                <div className="form-check ml-3">
                    <label className="form-check-label">
                        <input type="radio" onClick={handleTypeClick} checked={type == 'free'} value="free" className="form-check-input" name="type"/>
                        {'  '}
                        Free
                    </label>
                </div>
                <div className="form-check ml-3">
                    <label className="form-check-label">
                        <input type="radio" onClick={handleTypeClick} checked={type == 'paid'} value="paid" className="form-check-input" name="type"/>
                        {' '}
                        Paid
                    </label>
                </div>
            </React.Fragment>
        )
    }

    const showMedium = () => {
        return (
            <React.Fragment>
                <div className="form-check ml-3">
                    <label className="form-check-label">
                        <input type="radio" onClick={handleMediumClick} checked={medium == 'video'} value="video" className="form-check-input" name="medium"/>
                        {'  '}
                        Video
                    </label>
                </div>
                <div className="form-check ml-3">
                    <label className="form-check-label">
                        <input type="radio" onClick={handleMediumClick} checked={medium == 'book'} value="book" className="form-check-input" name="medium"/>
                        {' '}
                        Book
                    </label>
                </div>
            </React.Fragment>
        )
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

    const submitLinkForm = () => {
        return (
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="text-muted">Title</label>
                    <input type="text" className="form-control" onChange={handleTitleChange} value={title} />
                </div>
                <div className="form-group">
                    <label className="text-muted">URL</label>
                    <input type="text" className="form-control" onChange={handleURLChange} value={url} />
                </div>
                <div>
                    <button disabled={!token} type="submit" className="btn btn-outline-warning">
                        {(isAuth() || token) ? 'Post' : 'Login to Post'}
                    </button>
                </div>
            </form>
        )
    }

    return (
        <Layout>
            <div className="row">
                <div className="col-md-6">
                    <h1> Submit Link</h1>
                    <br />
                </div>
            </div>
            <div className="row">
                <div className="col-md-4">
                    <div className="form-group">
                        <label className="text-muted ml-4">Category</label>
                        <ul style={{maxHeight: '100px', overflowY: 'scroll'}}>{showCategories()}</ul>
                    </div>
                    <div className="form-group">
                        <label className="text-muted ml-4">Type</label>
                        {showTypes()}
                    </div>
                    <div className="form-group">
                        <label className="text-muted ml-4">Type</label>
                        {showMedium()}
                    </div>
                </div>
                <div className="col-md-8">
                    {success && showSuccessMessage(success)}
                    {error && showErrorMessage(error)}
                    {submitLinkForm()}
                </div>
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

export default Create