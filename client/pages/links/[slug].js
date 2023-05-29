import axios from 'axios'
import Layout from '../../components/Layout'
import renderHtml from 'react-render-html'
import moment from 'moment'
import { useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'

const Links = ({ slug, category, links, totalLinks, linksLimit, linkSkip  }) => {
    const [allLinks, setAllLinks] = useState(links)
    const [limit, setLimit] = useState(linksLimit)
    const [skip, setSkip] = useState(0)
    const [size, setSize] = useState(totalLinks)

    const handleClick = async linkID => {
        const response = await axios.put(`http://localhost:8000/api/click-count`, {linkID})
        loadUpdatedLinks()
    }

    const loadUpdatedLinks = async () => {
        const response = await axios.post(`http://localhost:8000/api/category/${slug}`)
        setAllLinks(response.data.links)
    }

    const listOfLinks = () => {
        console.log(links)
        return links.map((l, i) => {
            return (
                <div className="row alert alert-primary p-2">
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
                            <span className="badge text-success">{c.name}</span>
                        ))}
                    </div>
                </div>
            )
        })
    }

    const loadMore = async () => {
        let toSkip = skip + limit
        const response = await axios.post(`http://localhost:8000/api/category/${slug}`, { slug, limit, skip: toSkip})        
        let arr = allLinks
        for (const link of response.data.links) {
            arr.push(link)
        }
        setAllLinks(arr)
        setSize(response.data.links.length)
        setSkip(toSkip)
        console.log(allLinks)
    }

    // const loadMoreButton = () => {
    //     if (size > 0 && size >= limit) {
    //         return (
    //             <button onClick={loadMore} className='btn btn-outline-primary btn-lg'>
    //                 Load More
    //             </button>
    //         )
    //     }
    // }

    return (
        <Layout>
            <div className="row">
                <div className="col-md-8">
                    <h1 className='display-4 font-weight-bold'>{category.name} - Links</h1>
                    <div className='lead alert alert-secondary pt-4'>{renderHtml(category.content || '')}</div>
                </div>
                <div className="col-md-4">
                    <img src={category.image.url} alt={category.name} style={{width: 'auto', maxHeight: '200px'}} />
                </div>
            </div>
            <br />
            <div className="row">
                <div className="col-md-8">{listOfLinks()}</div>
                <div className="col-md-4">
                    <h2 className="lead">Most popular in {category.name}</h2>
                    <p>show popular links</p>
                </div>
            </div>

            {/* <div className='text-center pt-4 pb-5'>
                {loadMoreButton()}
            </div> */}
            <div className='row'>
                <div className='col-md-12 text-center'>
                    <InfiniteScroll
                        pageStart={0}
                        loadMore={loadMore}
                        hasMore={size > 0 && size >= limit}
                        loader={<img src='/static/images/loading.gif' alt='loading'/>}
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
    const { slug } = context.params
    const response = await axios.post(`http://localhost:8000/api/category/${slug}`, { slug, skip, limit})
    return {
      props: {
        slug,
        category: response.data.category,
        links: response.data.links,
        totalLinks: response.data.links.length,
        linksLimit: limit,
        linkSkip: skip
      }
    };
  }

export default Links