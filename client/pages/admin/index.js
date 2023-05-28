import Layout from "../../components/Layout"
import axios from "axios"
import Link from "next/link"

const Admin = () => {
    return (
        <Layout>
            <h1>Admin Dashboard</h1>
            <br />
            <div className="row">
                <div className="col-md-4">
                    <ul className="nav flex-column">
                        <li className="nav-item">
                            <Link className="nav-link" href="/admin/category/create">
                                Create Category
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="col-md-8">

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

export default Admin