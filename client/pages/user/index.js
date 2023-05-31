import Layout from "../../components/Layout"
import axios from "axios"
import Link from "next/link"
import moment from 'moment'
import Router from "next/router"

const User = ({ user, token, userLinks }) => {

    const confirmDelete = (e, id) => {
        e.preventDefault()
        let answer = window.confirm('Are you sure you want to delete?')
        if (answer) {
            handleDelete(id)
        }
    }

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:8000/api/link/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            console.log('Deleted ' , response)
            Router.replace('/user')
        } catch (error) {
            console.log(error)
        }
    }

    const listOfLinks = () => {
        return userLinks.map((l, i) => {
            return (
                <div key={i} className="row alert alert-primary p-2">
                    <div className="col-md-8">
                        <a href={l.url} target="_blank">
                            <h5 className="pt-2">{l.title}</h5>
                            <h6 className="pt-2 text-danger" style={{fontSize: '12px'}}>
                                {l.url}
                            </h6>
                        </a>
                    </div>
                    <div className="col-md-4 pt-2">
                        <span className="pull-right">
                            {moment(l.createdAt).fromNow()} by {l.postedBy.name} 
                        </span>
                    </div>
                    <div className="col-md-12">
                        <span className="badge text-dark">
                            {l.type} / {l.medium}
                        </span>
                        {l.categories.map((c, i) => (<span className="badge text-success">{c.name}</span>))}
                        <span className="badge text-secondary">
                            {l.clicks} clicks
                        </span>
                        <Link href={`/user/link/${l._id}`}>
                            <span className="badge text-warning pull-right">
                                Update
                            </span>
                        </Link>
                        <span onClick={(e) => confirmDelete(e, l._id)} className="badge text-danger pull-right">
                            Delete
                        </span>
                    </div>
                </div>
            )
        })
    }

    return (
        <Layout>
             <h1>
                {user.name}'s dashboard <span className="text-danger">/{user.role}</span>
             </h1>
             <hr />
             <div className="row">
                <div className="col-md-4">
                    <ul className="nav flex-column">
                        <li className="nav-item">
                            <Link href="/user/link/create">
                                Submit a link
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/user/profile/update">
                                Update profile
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="col-md-8">
                    <h2>Your links</h2>
                    <br />
                    {listOfLinks()}
                </div>
            </div>
        </Layout>
    )
}

export async function getServerSideProps(context) {
    const token = context.req.cookies.token
    let user = null
    let userLinks = []
    if (token) {
        try {
            const response = await axios.get(`http://localhost:8000/api/user`, {
                headers: {
                    authorization: `Bearer ${token}`,
                    contentType: 'application/json'
                }
            })
            user = response.data.user
            userLinks = response.data.links
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
                token,
                userLinks
            }
        }
    }
}

export default User