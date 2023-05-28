import Link from 'next/link';
import Layout from '../components/Layout'
import axios from 'axios';

const Home = ({ categories }) => {
    const listCategories = () => {
        return (categories.map((c, i) => {
                return (
                    <Link href="/" className='bg-light p-3 col-md-4' style={{border: '1px solid red'}}>
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