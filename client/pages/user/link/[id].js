import { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import axios from 'axios';
import { isAuth } from '../../../helpers/auth';
import { showSuccessMessage, showErrorMessage } from '../../../helpers/alerts';
import React from 'react';

const Update = ({ user, token, oldLink, loadCategories }) => {
    // state
    console.log(oldLink)
    const [state, setState] = useState({
        title: oldLink.title,
        url: oldLink.url,
        categories: oldLink.categories,
        loadedCategories: loadCategories,
        success: '',
        error: '',
        type: oldLink.type,
        medium: oldLink.medium
    });

    const { title, url, categories, loadedCategories, success, error, type, medium } = state;

    const handleTitleChange = e => {
        setState({ ...state, title: e.target.value, error: '', success: '' });
    };

    const handleURLChange = e => {
        setState({ ...state, url: e.target.value, error: '', success: '' });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        // console.table({ title, url, categories, type, medium });
        try {
            const response = await axios.put(
                `http://localhost:8000/api/link/${oldLink._id}`,
                { title, url, categories, type, medium },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setState({ ...state, success: 'Link is updated' });
        } catch (error) {
            console.log('LINK SUBMIT ERROR', error);
            setState({ ...state, error: error.response.data.error });
        }
    };

    const handleTypeClick = e => {
        setState({ ...state, type: e.target.value, success: '', error: '' });
    };

    const handleMediumClick = e => {
        setState({ ...state, medium: e.target.value, success: '', error: '' });
    };

    const showMedium = () => (
        <React.Fragment>
            <div className="form-check ml-3">
                <label className="form-check-label">
                    <input
                        type="radio"
                        onClick={handleMediumClick}
                        checked={medium === 'video'}
                        value="video"
                        className="from-check-input"
                        name="medium"
                    />{' '}
                    Video
                </label>
            </div>

            <div className="form-check ml-3">
                <label className="form-check-label">
                    <input
                        type="radio"
                        onClick={handleMediumClick}
                        checked={medium === 'book'}
                        value="book"
                        className="from-check-input"
                        name="medium"
                    />{' '}
                    Book
                </label>
            </div>
        </React.Fragment>
    );

    const showTypes = () => (
        <React.Fragment>
            <div className="form-check ml-3">
                <label className="form-check-label">
                    <input
                        type="radio"
                        onClick={handleTypeClick}
                        checked={type === 'free'}
                        value="free"
                        className="from-check-input"
                        name="type"
                    />{' '}
                    Free
                </label>
            </div>

            <div className="form-check ml-3">
                <label className="form-check-label">
                    <input
                        type="radio"
                        onClick={handleTypeClick}
                        checked={type === 'paid'}
                        value="paid"
                        className="from-check-input"
                        name="type"
                    />{' '}
                    Paid
                </label>
            </div>
        </React.Fragment>
    );

    const handleToggle = c => () => {
        // return the first index or -1
        const clickedCategory = categories.indexOf(c);
        const all = [...categories];

        if (clickedCategory === -1) {
            all.push(c);
        } else {
            all.splice(clickedCategory, 1);
        }
        console.log('all >> categories', all);
        setState({ ...state, categories: all, success: '', error: '' });
    };

    // show categories > checkbox
    const showCategories = () => {
        console.log('hello ', loadedCategories)
        return (
            loadedCategories &&
            loadedCategories.map((c, i) => (
                <li className="list-unstyled" key={c._id}>
                    <input
                        type="checkbox"
                        checked={categories.includes(c._id)}
                        onChange={handleToggle(c._id)}
                        className="mr-2"
                    />
                    <label className="form-check-label">{c.name}</label>
                </li>
            ))
        );
    };

    // link create form
    const submitLinkForm = () => (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="text-muted">Title</label>
                <input type="text" className="form-control" onChange={handleTitleChange} value={title} />
            </div>
            <div className="form-group">
                <label className="text-muted">URL</label>
                <input type="url" className="form-control" onChange={handleURLChange} value={url} />
            </div>
            <div>
                <button disabled={!token} className="btn btn-outline-warning" type="submit">
                    {isAuth() || token ? 'Update' : 'Login to update'}
                </button>
            </div>
        </form>
    );

    return (
        <Layout>
            <div className="row">
                <div className="col-md-12">
                    <h1>Update Link/URL</h1>
                    <br />
                </div>
            </div>
            <div className="row">
                <div className="col-md-4">
                    <div className="form-group">
                        <label className="text-muted ml-4">Category</label>
                        <ul style={{ maxHeight: '100px', overflowY: 'scroll' }}>{showCategories()}</ul>
                    </div>
                    <div className="form-group">
                        <label className="text-muted ml-4">Type</label>
                        {showTypes()}
                    </div>
                    <div className="form-group">
                        <label className="text-muted ml-4">Medium</label>
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
    );
};

export async function getServerSideProps(context) {
    const token = context.req.cookies.token
    const {id} = context.params
    let user = null
    let oldLink = null
    let loadCategories = null
    if (token) {
        try {
            const response = await axios.get(`http://localhost:8000/api/user`, {
                headers: {
                    authorization: `Bearer ${token}`,
                    contentType: 'application/json'
                }
            })
            user = response.data.user
            const response2 = await axios.get(`http://localhost:8000/api/link/${id}`)
            oldLink = response2.data
            const response3 = await axios.get(`http://localhost:8000/api/categories`)
            loadCategories = response3.data
            console.log(loadCategories)
        } catch(error) {
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
                token,
                oldLink,
                loadCategories
            }
        }
    }
}

export default Update