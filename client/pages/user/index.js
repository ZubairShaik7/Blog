import Layout from "../../components/Layout"
import axios from "axios"
import { getCookie } from "../../helpers/auth"
import withUser from "../withUser"

const User = ({ user, token }) => {
    return (
        <Layout> {JSON.stringify(user)}</Layout>
    )
}

export async function getServerSideProps(context) {
    const token = context.req.cookies.token
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
            if (error.response.status == 401) {
                user = null
            }
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

export default User