import Link from 'next/link';
import Layout from '../components/Layout'
import axios from 'axios';
import { useEffect, useState } from 'react';
import moment from 'moment';

const Home = ({ categories }) => {
    const [popular, setPopular] = useState([])

    useEffect(() => {
        loadPopular()
    }, [])

    const loadPopular = async () => {
        const response = await axios.get(`http://localhost:8000/api/link/popular`)
        setPopular(response.data)
    }

    const handleClick = async (linkID) => {
        const response = await axios.get(`http://localhost:8000/api/click-count`, { linkID })
        loadPopular()
    }

    const listOfLinks = () => {
        return popular.map((l, i) => {
            return (
                <div className='row alert alert-secondary p-2'>
                    <div className='col-md-8' onClick={() => handleClick(l._id)}>
                        <a target="_blank" href={l.url}>
                            <h5 className='pt-2'>{l.title}</h5>
                            <h6 className='pt-2 text-danger' style={{fontSize: '12px'}}>
                                {l.url}
                            </h6>
                        </a>
                    </div>
                    <div className='col-md-4 pt-2'>
                        <span className='pull-right'>
                            {moment(l.createdAt).fromNow()} by {l.postedBy.name}
                        </span>
                    </div>
                    <div className='col-md-12'>
                        <span className='badge text-dark'>
                            {l.type} {l.medium}
                        </span>
                        {l.categories.map((c, i) => {
                            return (
                                <span key={i} className='badge text-success'>
                                    {c.name}
                                </span>
                            )
                        })}
                        <span className='badge text-secondary pull-right'>
                            {l.clicks} clicks
                        </span>
                    </div>
                </div>
            )
        })
    }

    const listCategories = () => {
        return (categories.map((c, i) => {
                return (
                    <Link href={`/links/${c.slug}`} className='bg-light p-3 col-md-4' style={{border: '1px solid red'}}>
                        <div>
                            <div className="row">
                                <div className="col-md-4">
                                    <img
                                        src={c.image && c.image.url}
                                        alt={c.name}
                                        style={{ width: '100px', height: 'auto' }}
                                        className="pr-3"
                                    />
                                </div>
                                <div className="col-md-8">
                                    <h3>{c.name}</h3>
                                </div>
                            </div>
                        </div>
                    </Link>
                )
        }))
    }
    
    return (
    <Layout>
        <div className='row'>
            <div className='col-md-12'>
                <h1 className='font-weight-bold'>Browse Tutorials/Courses</h1>
                <br />
            </div>
        </div>
        <div className="row">{listCategories()}</div>
        <div className='row pt-5'>
            <h2 className='font-weight-bold pb-3'>Trending</h2>
            <div className='col-md-12 overflow-hidden'>
                {listOfLinks()}
            </div>
        </div>
    </Layout>
    )
}

Home.getInitialProps = async () => {
    const response = await axios.get(`http://localhost:8000/api/categories`)
    return {
        categories: response.data
    }
}

export default Home;