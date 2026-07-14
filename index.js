import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import axios from "axios";
const app = express();
const port = 3000;
const API_KEY = process.env.TMDB_API_KEY;
app.set("view engine", "ejs");
app.use(express.static("public"));
app.get("/", async (req, res) => {

    try{

        const trendingResponse = await axios.get(
            "https://api.themoviedb.org/3/trending/movie/day",
            {
                params:{
                    api_key:API_KEY
                }
            }
        );

        const trendingMovies = trendingResponse.data.results
            .filter(movie => movie.poster_path)
            .slice(0,12);

        res.render("index",{
            trendingMovies,
            IMAGE_BASE_URL
        });

    }catch(error){

        console.log(error.message);

        res.render("index",{
            trendingMovies:[],
            IMAGE_BASE_URL
        });

    }

});
app.get("/search", async (req, res) => {
      const movie = req.query.movie;
      console.log(movie);
      try{
        const response = await axios.get("https://api.themoviedb.org/3/search/movie",{
            params:
            {
                api_key: API_KEY,
                query: movie,
            }  
        });
        const movies = response.data.results
    .filter(movie => movie.poster_path);
    if (movies.length === 0) {
        return res.render("notFound", {
            searchQuery: movie
        });
    }
        movies.sort((a, b) => b.vote_average - a.vote_average);
        console.log(response.data.results[0].title);
        res.render("movies", {
            movies:movies,
            searchQuery: movie
        });
      }
        catch(error){
            console.log(error.message);
        }
});
app.get("/movie/:id", async (req, res) => {
    const id = req.params.id;
    try {

        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/${id}`,
            {
                params:{
                    api_key:API_KEY
                }
            }
        );
        const imagesResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${id}/images`,
            {
                params:{
                    api_key:API_KEY
                }
            }
        );
        const castResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${id}/credits`,
            {
                params:{
                    api_key:API_KEY
                }
            }
        );
        const videosResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${id}/videos`,
            {
                params: {
                    api_key: API_KEY
                }
            }
        );
        const similarResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${id}/similar`,
            {
                params:{
                    api_key:API_KEY
                }
            }
        );
        
        const similarMovies = similarResponse.data.results
            .filter(movie => movie.poster_path)
            .sort((a,b) => b.vote_average - a.vote_average)
            .slice(0,8);
        const trailer = videosResponse.data.results.find(
            video =>
                video.type === "Trailer" &&
                video.site === "YouTube"
        );
        const cast = castResponse.data.cast;
    
        const uniqueImages = imagesResponse.data.backdrops.filter(
            (image, index, self) =>
                index === self.findIndex(img => img.file_path === image.file_path)
        );
        
        const images = uniqueImages.slice(0, 9);

        res.render("movie", {
            movie: response.data,
            images,
            cast,
            trailer,
            similarMovies,
            IMAGE_BASE_URL
        });
    
    } catch(error){
    
        console.log(error.message);
    
    }
});
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
app.get("/person/:id", async (req, res) => {

    const id = req.params.id;

    try {

        const personResponse = await axios.get(
            `https://api.themoviedb.org/3/person/${id}`,
            {
                params: {
                    api_key: API_KEY
                }
            }
        );

        const creditsResponse = await axios.get(
            `https://api.themoviedb.org/3/person/${id}/movie_credits`,
            {
                params: {
                    api_key: API_KEY
                }
            }
        );

        const movies = creditsResponse.data.cast
            .filter(movie => movie.poster_path)
            .sort((a, b) => b.popularity - a.popularity);

        res.render("person", {

            person: personResponse.data,

            movies,

            IMAGE_BASE_URL

        });

    } catch (error) {

        console.log(error.message);

    }

});
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})
