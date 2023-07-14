import React, { useEffect, useState } from 'react'
import './MovieDetail.css'
import { useParams } from 'react-router-dom'
import { useContext } from 'react';
import { MovieContext } from '../context';
import Navbar from '../components/Navbar';
import Cast from '../components/Cast';
import Suggestions from '../components/Suggestions';
import Loading from '../components/Loader';
import { FaYoutube,FaTimes } from 'react-icons/fa';

import {AiOutlinePlusCircle } from 'react-icons/ai'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../firebase'
function MovieDetail() {
  const {loading,setLoading}=useContext(MovieContext)
  const [trailerUrl, setTrailerUrl] = useState(null);

  const { id } = useParams();
  const [movie, setMovie] = useState('')
  const [cast, setCast] = useState('')
  const detailUrl = `https://api.themoviedb.org/3/movie/${id}?api_key=c749165fc96671c286d19d7f046e41e5`
  const getData = async () => {
    const res = await fetch(detailUrl);
    const data = await res.json();
    setMovie(data)
    setLoading(false)
  }
  const getCast=async()=>{
    const res=await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=c749165fc96671c286d19d7f046e41e5`)
    const data=await res.json();
    setCast(data.cast.slice(0,5))
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([getData(),getCast()]).then(() => {
      setLoading(false);
    }).catch((error) => {
      console.error(error);
    });
  }, [id]);

  // trailer endpoint
    const url=`https://api.themoviedb.org/3/movie/${id}/videos?api_key=c749165fc96671c286d19d7f046e41e5`
   const fetchData=async ()=>{
    const res=await fetch(url)
    const data=await res.json();
    const trailers = data.results.filter(video => video.type === "Trailer");
    if(trailers.length>0){
      setTrailerUrl(trailers[0])      
    }
    else{
      setTrailerUrl(data.results[0])
    }
   }
  const showModal=()=>{
    const modal=document.querySelector('#modal')
   fetchData();
    modal.showModal();
  }
  const handleClose=()=>{
    const modal=document.querySelector('#modal')
    setTrailerUrl(null)
    modal.close();
  }
  const { budget, genres, original_title, overview, poster_path, release_date, runtime ,production_countries,spoken_languages,status,revenue} = movie
  const imageUrl = poster_path ? `https://image.tmdb.org/t/p/w200${poster_path}` : 'https://picsum.photos/200/300'
  document.title=original_title+" | LeeCinemas"
  if(loading){
    return (
      <>
      <Navbar/>
      <Loading/>
      </>
    )
  }

  const handleAdd=()=>{
    const colref=collection(db,'test')
    const payload={
      name:'arun'
    }
    try{
      addDoc(colref,payload)

    }
    catch{
      console.log('err adding')
    }
  }


  return (
    <div>
      <Navbar />
      {movie && <div className='movie-detail container  my-3 p-3'>
      <div onClick={handleAdd} className=' favorite bg-dark rounded-circle'><AiOutlinePlusCircle  height={75} width={75} fill='#fff'/></div>
          <div className="poster">
            <img src={imageUrl} />
          </div>
          <div className="movieInfos ">
            <h2>{original_title}</h2>
            <div className='movie-info-grid'><div className="left">
              <div className="genre d-flex align-items-center">
                <p>Genre : </p> {genres.map((item, index) => {
                  return <span key={index}> { item.name}{index !== genres.length - 1 ? ', ' : ''} </span>
                })}
              </div>
              <p >Budget : <span>${budget || null}</span></p>            

 <div className="spoken_languages d-flex align-items-center">
                <p>Language/s : </p> {spoken_languages.map((item, index) => {
                  return <span key={index}>{item.name}{index !== spoken_languages.length - 1 ? ', ' : ''}</span>
                })}
              </div>


              <div className="production_countries d-flex align-items-center">
                <p>Country</p> : {production_countries.map((item, index) => {
                  return <span key={index}>{item.name}{index !== production_countries.length - 1 ? ', ' : ''}</span>
                })}
            </div>
            </div>
              <div className="right">
                <p>Status : <span>{status}</span></p>
                <p>Runtime : <span>{runtime} Minutes</span></p>
                <p>Release : <span>{release_date}</span></p>
                <p>Revenue : <span>${revenue}</span> </p>
              </div>
            </div>
            <p className='my-2 fw-lighter text-info font-italic' style={{fontStyle:'italic'}}>{overview}</p>
            <div className=''><p onClick={showModal} className='btn btn-secondary d-inline-block shadow-lg p-2'><span className='mx-2 '><FaYoutube size={32} color='red'/></span>Watch trailer</p>
           
            </div>
            <span className='badge bg-info text-white my-2'>Top Cast</span>
            <Cast cast={cast} setCast={setCast}/>
          </div>
          <div className="d-flex">
          <dialog id='modal'>
          {trailerUrl?<iframe className='bg-dark' width="560" height="315" src={`https://www.youtube.com/embed/${trailerUrl.key}?autoplay=1`} frameborder="0" allowfullscreen></iframe>:<p>No videos available.:/</p>}
        <button className='btn btn-secondary' onClick={handleClose}><FaTimes/></button>
          </dialog>
          </div>
        

        </div>
      }     
      <div className="container">
      <span className="bg-secondary text-light recomendation p-2 fw-bolder">
        You might also like
      </span>
      <Suggestions id={id} url={`https://api.themoviedb.org/3/movie/${id}/similar?api_key=c749165fc96671c286d19d7f046e41e5`} />
      </div>
     
    </div>
  )
}


export default MovieDetail
