import Router from "next/router"
import { useState, useEffect } from "react"
import jwt from 'jsonwebtoken'
import axios from 'axios'
import { showSuccessMessage, showErrorMessage } from '../../../helpers/alerts'
import { API } from '../../../config'
import Layout from "../../../components/Layout"

const ForgotPassword = () => {
    const [state, setState] = useState({
        email: '',
        buttonText: 'Send Email',
        success: '',
        error: ''
    })
    const { email, buttonText, success, error } = state

    const handleChange = (name) => (e) => {
        setState({ ...state, email: e.target.value , success: '', error: ''})
    }

    const handleSubmit = async e => {
        e.preventDefault()
        try {
            const response = await axios.put(`http://localhost:8000/api/forgot-password`, {
                email
            })
            console.log(response)
            setState({
                ...state,
                email: '',
                buttonText: 'Done',
                success: response.data.message
            })
        } catch (error) {
            setState({...state, buttonText: 'Send Email', error: error.response.data.error})
        }
    }

    const passwordForgotForm = () => {
        return(
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input 
                        value={email} 
                        onChange={handleChange('email')} 
                        type='email' 
                        className='form-control' 
                        placeholder='Type your email' 
                        required
                    />
                </div>
                <div className="form-group">
                    <button className="btn btn-outline-warning btn-block">{buttonText}</button>
                </div>
            </form>
        )
    }

    return (
    <Layout>
        <div className="row">
            <div className="col-md-6 offset-md-3">
                <h1>Forgot Password</h1>
                <br />
                {success && showSuccessMessage(success)}
                {error && showErrorMessage(error)}
                {passwordForgotForm()}
            </div>
        </div>
    </Layout>
    )
}

export default ForgotPassword