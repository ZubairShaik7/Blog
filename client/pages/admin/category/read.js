import { useState, useEffect } from "react";
import Layout from "../../../components/Layout";
import axios from "axios";
import Resizer from 'react-image-file-resizer'
import { showSuccessMessage, showErrorMessage } from '../../../helpers/alerts'
import Link from "next/link";

const Read = ({ user, token }) => {
    const [state, setState] = useState({
        error: '',
        success: '',
        categories: []
    })

    const { error, success, categories } = state

    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        const response = await axios.get(`http://localhost:8000/api/categories`)
        setState({...state, categories: response.data})
    }

    const confirmDelete = (e, slug) => {
        e.preventDefault()
        let answer = window.confirm('Are you sure you want to delete?')
        if (answer) {
            handleDelete(slug)
        }
    }

    const handleDelete = async (slug) => {
        try {
            const response = await axios.delete(`http://localhost:8000/api/category/${slug}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            console.log('Deleted ' , response)
            loadCategories()
        } catch (error) {

        }
    }

    const listCategories = () => {
        return (categories.map((c, i) => {
            return (
                <Link key={i} href={`/links/${c.slug}`} className='bg-light p-3 col-md-4' style={{border: '1px solid red'}}>
                    <div>
                        <div className="row">
                            <div className="col-md-3">
                                <img
                                    src={c.image && c.image.url}
                                    alt={c.name}
                                    style={{ width: '100px', height: 'auto' }}
                                    className="pr-3"
                                />
                            </div>
                            <div className="col-md-6">
                                <h3>{c.name}</h3>
                            </div>
                            <div className="col-md-3">
                                <Link href={`/admin/category/${c.slug}`}>
                                    <button className="btn btn-sm btn-outline-success btn-block mb-1">Update</button>
                                </Link>
                                <button onClick={(e) => confirmDelete(e, c.slug)} className="btn btn-sm btn-outline-danger btn-block">Delete</button>
                            </div>
                        </div>
                    </div>
                </Link>
            )
        }))
    }

    return (
        <Layout>
            <div className="row">
                <div className="col">
                    <h1>List of categories</h1>
                    <br />
                </div>
            </div>
            <div className="row">
                {listCategories()}
            </div>
        </Layout>
    )
}

export async function getServerSideProps(context) {
    const token = context.req.cookies.token
    let user = null
    if (token) {
        try {
            const response = await axios.get(`http://localhost:8000/api/admin`, {
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

export default Read