import { withRouter} from "next/router"
import { useState, useEffect } from "react"
import jwt from 'jsonwebtoken'
import axios from 'axios'
import { showSuccessMessage, showErrorMessage } from "../../../../helpers/alerts"
import Layout from "../../../../components/Layout"
import Router from "next/router"

const ResetPassword = ({ router }) => {
    const [state, setState] = useState({
        name: '',
        token: '',
        newPassword: '',
        buttonText: 'Reset Password',
        success: '',
        error: ''
    })
    const { name, token, newPassword, buttonText, success, error } = state

    useEffect(() => {
        const decoded = jwt.decode(router.query.id)
        if (decoded) {
            setState({ ...state, name: decoded.name, token: router.query.id })
        }
    }, [router])

    const handleChange = (name) => (e) => {
        setState({ ...state, newPassword: e.target.value , success: '', error: ''})
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setState({ ...state, buttonText: 'Sending'})
        try {
            const response = await axios.put(`http://localhost:8000/api/reset-password`, {
                resetPasswordLink: token,
                newPassword
            })
            console.log(response)
            setState({
                ...state,
                newPassword: '',
                buttonText: 'Done',
                success: response.data.message
            })
        } catch (error) {
            console.log(error)
            setState({...state, buttonText: 'Reset Password', error: error.response.data.error})
        }
    }

    const passwordResetForm = () => {
        return (
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input 
                        value={newPassword} 
                        onChange={handleChange('email')} 
                        type='password' 
                        className='form-control' 
                        placeholder='Type your new password' 
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
                <h1>Reset Password</h1>
                <br />
                {success && showSuccessMessage(success)}
                {error && showErrorMessage(error)}
                {passwordResetForm()}
            </div>
        </div>
    </Layout>
    )
} 

export default withRouter(ResetPassword)