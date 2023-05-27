import axios from "axios";
import { getCookie } from "../helpers/auth";

const withUser = (Page) => {
    const withAuthUser = props => {
        <Page {...props} />
    }
    withAuthUser.getInitialProps = async context => {
        console.log(context.req.cookies.token)
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
                if (error.response.status == 401) {
                    user = null
                }
            }
        }
        if (user == null) {
            context.res.writeHead(302, {
                Location: '/'
            })
        } else {
            return {
                ...Page(Page.getInitialProps ? await Page.getInitialProps(context) : {}),
                user,
                token
            }
        }
    }
    return withAuthUser
}

export default withUser