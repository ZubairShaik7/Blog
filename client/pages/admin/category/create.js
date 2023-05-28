import { useState, useEffect } from "react";
import Layout from "../../../components/Layout";
import axios from "axios";
import Resizer from 'react-image-file-resizer'
import { showSuccessMessage, showErrorMessage } from '../../../helpers/alerts'
import dynamic from "next/dynamic";
//import 'react-quill/dist/quill.bubble.css'
import 'react-quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr:false })

const Create = ({ user, token }) => {
    const [state, setState] = useState({
        name: 'react-js',
        error: '',
        success: '',
        buttonText: 'Create',
        imageUploadText: 'Upload Image',
        image: ''
    })

    const [content, setContent] = useState('')

    const [imageUploadButtonName, setImageUploadButtonName] = useState('Upload Image')

    const { name, error, success, buttonText, imageUploadText, image} = state

    const handleChange = name => e => {
        setState({...state, [name]: e.target.value, error: '', success: ''})
    }

    const handleContent = e => {
        setContent(e)
        setState({...state, success: '', error: ''})
    }

    const handleImage = event => {
        let fileInput = false;
        if (event.target.files[0]) {
            fileInput = true
        }
        setImageUploadButtonName(event.target.files[0].name);
        if (fileInput) {
            Resizer.imageFileResizer(
                event.target.files[0],
                300,
                300,
                'JPEG',
                100,
                0,
                uri => {
                    // console.log(uri);
                    setState({ ...state, image: uri, success: '', error: '' })
                },
                'base64'
            );
        }
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setState({...state, buttonText: 'Creating'})
        console.table({ name, content, image })
        try {
            const response = await axios.post(`http://localhost:8000/api/category`, { name, image, content }, {
                headers: {
                    authorization: `Bearer ${token}`
                }
            })
            console.log('CATEGORY CREATE RESPONSE', response);
            setImageUploadButtonName('Upload image');
            setState({
                ...state,
                name: '',
                content: '',
                buttonText: 'Created',
                imageUploadText: 'Upload image',
                success: `${response.data.name} is created`
            })
        } catch (error) {
            console.log(error.response)
            setState({...state, name: '', buttonText: 'Create', error: error.response.data.error})
        }

    }

    const createCategoryForm = () => {
        return (
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="text-muted">Name</label>
                    <input onChange={handleChange('name')} value={name} type="text" className="form-control" required />
                </div>
                <div className="form-group">
                    <label className="text-muted">Content</label>
                    <ReactQuill
                        value={content}
                        onChange={handleContent}
                        placeholder="Write something..."
                        theme="snow"
                        className="pb-5 mb-3"
                        style={{border: '1px solid #666'}}
                    />
                </div>
                <div className="form-group">
                    <label className="btn btn-outline-secondary">
                        {imageUploadButtonName}
                        <input onChange={handleImage} type="file" accept="image/*" className="form-control" hidden />
                    </label>
                </div>
                <div>
                    <button className="btn btn-outline-warning">{buttonText}</button>
                </div>
            </form>
        )
    }

    return (
        <Layout>
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <h1>Create category</h1>
                    <br />
                    {success && showSuccessMessage(success)}
                    {error && showErrorMessage(error)}
                    {createCategoryForm()}
                </div>
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

export default Create