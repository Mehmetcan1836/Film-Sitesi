import json
import os
from tmdbv3api import TMDb, Movie, TV

# Initialize TMDB
tmdb = TMDb()
tmdb.api_key = 'YOUR_TMDB_API_KEY'  # You'll need to replace this with your actual TMDB API key
tmdb.language = 'tr'  # Turkish language

def update_movies():
    # Read movies.json
    with open('data/movies.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    movie_api = Movie()
    
    for movie in data['content']:
        title = movie['title']
        year = movie.get('year')
        
        # Search for the movie
        search = movie_api.search(title)
        
        if search:
            # Try to find the best match
            best_match = None
            for result in search:
                # If we have a year, try to match it
                if year and 'release_date' in result and result['release_date']:
                    result_year = int(result['release_date'].split('-')[0])
                    if abs(result_year - year) <= 1:  # Allow 1 year difference
                        best_match = result
                        break
            
            # If no year match, take the first result
            if not best_match and search:
                best_match = search[0]
            
            if best_match:
                movie['tmdb_id'] = best_match['id']
                print(f"Updated {title} with TMDB ID: {best_match['id']}")
    
    # Save updated movies.json
    with open('data/movies.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def update_series():
    # Read series.json
    with open('data/series.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    tv_api = TV()
    
    for series in data['series']:
        title = series['title']
        year = series.get('year')
        
        # Search for the TV show
        search = tv_api.search(title)
        
        if search:
            # Try to find the best match
            best_match = None
            for result in search:
                # If we have a year, try to match it
                if year and 'first_air_date' in result and result['first_air_date']:
                    result_year = int(result['first_air_date'].split('-')[0])
                    if abs(result_year - year) <= 1:  # Allow 1 year difference
                        best_match = result
                        break
            
            # If no year match, take the first result
            if not best_match and search:
                best_match = search[0]
            
            if best_match:
                series['tmdb_id'] = best_match['id']
                print(f"Updated {title} with TMDB ID: {best_match['id']}")
    
    # Save updated series.json
    with open('data/series.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    print("Updating movies...")
    update_movies()
    print("\nUpdating series...")
    update_series()
    print("\nUpdate complete!")
