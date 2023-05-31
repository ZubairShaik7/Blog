import axios from 'axios'
import Layout from '../../../components/Layout'
import renderHtml from 'react-render-html'
import moment from 'moment'
import { useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import Link from 'next/link'

const Links = ({ slug, user, token, links, totalLinks, linksLimit, linkSkip  }) => {
    const [allLinks, setAllLinks] = useState(links)
    const [limit, setLimit] = useState(linksLimit)
    const [skip, setSkip] = useState(0)
    const [size, setSize] = useState(totalLinks)

    const confirmDelete = (e, id) => {
        e.preventDefault()
        let answer = window.confirm('Are you sure you want to delete?')
        if (answer) {
            handleDelete(id)
        }
    }

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:8000/api/link/admin/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            console.log('Deleted ' , response)
            typeof window && window.location.reload()
        } catch (error) {
            console.log(error)
        }
    }

    const listOfLinks = () => {
        console.log(links)
        return links.map((l, i) => {
            return (
                <div key={i} className="row alert alert-primary p-2">
                    <div className="col-md-8" onClick={e => handleClick(l._id)}>
                        <a href={l.url} target="_blank">
                            <h5 className="pt-2">{l.title}</h5>
                            <h6 className="pt-2 text-danger" style={{ fontSize: '12px' }}>
                                {l.url}
                            </h6>
                        </a>
                    </div>
                    <div className="col-md-4 pt-2">
                        <span className="pull-right">
                            {moment(l.createdAt).fromNow()} by {l.postedBy.name}
                        </span>
                        <span className='badge text-secondary pull-right'>
                            {l.clicks} clicks
                        </span>
                    </div>
                    <div className="col-md-12">
                        <span className="badge text-dark">
                            {l.type} / {l.medium}
                        </span>
                        {l.categories.map((c, i) => (
                            <span key={i} className="badge text-success">{c.name}</span>
                        ))}
                        <span onClick={(e) => confirmDelete(e, l._id)} className='badge text-danger pull-right'>
                            Delete
                        </span>
                        <Link href={`/user/link/${l._id}`}>
                            <span className='badge text-warning pull-right'>Update</span>
                        </Link>
                    </div>
                </div>
            )
        })
    }

    const loadMore = async () => {
        let toSkip = skip + limit
        const response = await axios.post(`http://localhost:8000/api/links`, { toSkip, limit}, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })        
        let arr = allLinks
        for (const link of response.data) {
            arr.push(link)
        }
        setAllLinks(arr)
        setSize(response.data.length)
        setSkip(toSkip)
        console.log(allLinks)
    }

    return (
        <Layout>
            <div className="row">
                <div className="col-md-12">
                    <h1 className='display-4 font-weight-bold'>All Links</h1>
                </div>
            </div>
            <br />
            <div className="row">
                <div className="col-md-12">{listOfLinks()}</div>
            </div>
            <div className='row'>
                <div className='col-md-12'>
                    <InfiniteScroll
                        pageStart={0}
                        loadMore={loadMore}
                        hasMore={size > 0 && size >= limit}
                        loader={<img key={0} src='/static/images/loading.gif' alt='loading'/>}
                    >
                    </InfiniteScroll>
                </div>
            </div>
        </Layout>
    )
}

export async function getServerSideProps(context) {
    let skip = 0
    let limit = 2
    const slug = context.query
    const token = context.req.cookies.token
    let user = null
    let oldCategory = null
    if (token) {
        try {
            const response = await axios.get(`http://localhost:8000/api/admin`, {
                headers: {
                    authorization: `Bearer ${token}`,
                    contentType: 'application/json'
                }
            })
            user = response.data
            try {
                const response2 = await axios.post(`http://localhost:8000/api/links`, { skip, limit}, {
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                })
                oldCategory = response2.data
            } catch (error) {
                console.log(error.response)
            }
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
                slug,
                user,
                token,
                links: oldCategory,
                totalLinks: oldCategory.length,
                linksLimit: limit,
                linkSkip: skip
            }
        }
    }
  }

export default Links