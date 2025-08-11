import json
import os
from tmdbv3api import TMDb, Movie, TV

# Initialize TMDB
tmdb = TMDb()
tmdb.api_key = '995d04f68f5dc7d1299752f1510bc93d'  # You'll need to replace this with your actual TMDB API key
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
    updated_count = 0
    
    for series in data['series']:
        title = series['title']
        original_title = series.get('original_title', title)  # Use original title if available
        year = series.get('year')
        
        print(f"\nProcessing series: {title}")
        
        try:
            # Search for the TV show
            search_results = tv_api.search(original_title) or tv_api.search(title)
            
            if not search_results:
                print(f"  No results found for: {title}")
                continue
                
            # Try to find the best match
            best_match = None
            
            # First pass: Exact title match with year
            for result in search_results:
                result_title = result.get('name', '').lower()
                result_original_title = result.get('original_name', result_title).lower()
                
                # Check title match (either original or translated)
                title_matches = (
                    result_title == title.lower() or 
                    result_original_title == original_title.lower() or
                    result_title == original_title.lower()
                )
                
                # Check year if available
                year_matches = True
                if year and 'first_air_date' in result and result['first_air_date']:
                    result_year = int(result['first_air_date'].split('-')[0])
                    year_matches = abs(result_year - year) <= 2  # Allow 2 years difference
                
                if title_matches and year_matches:
                    best_match = result
                    print(f"  Found exact match: {result.get('name')} ({result.get('first_air_date')})")
                    break
            
            # Second pass: If no exact match, try with partial title match
            if not best_match:
                for result in search_results:
                    result_title = result.get('name', '').lower()
                    result_original_title = result.get('original_name', result_title).lower()
                    
                    # Check for partial match in title
                    title_matches = (
                        title.lower() in result_title or
                        title.lower() in result_original_title or
                        original_title.lower() in result_title or
                        original_title.lower() in result_original_title
                    )
                    
                    if title_matches:
                        best_match = result
                        print(f"  Found partial match: {result.get('name')} ({result.get('first_air_date')})")
                        break
            
            # If still no match, take the first result but log a warning
            if not best_match and search_results:
                best_match = search_results[0]
                print(f"  Using first result (potential mismatch): {best_match.get('name')}")
            
            # Update the series with TMDB data
            if best_match:
                series['tmdb_id'] = best_match['id']
                
                # Update other fields if they're missing
                if 'original_title' not in series:
                    series['original_title'] = best_match.get('original_name', '')
                
                if 'overview' not in series and best_match.get('overview'):
                    series['description'] = best_match['overview']
                
                if 'poster_path' in best_match and best_match['poster_path']:
                    series['image'] = f"https://image.tmdb.org/t/p/w500{best_match['poster_path']}"
                
                updated_count += 1
                print(f"  Updated: {title} (TMDB ID: {best_match['id']})")
        
        except Exception as e:
            print(f"  Error processing {title}: {str(e)}")
    
    # Save updated series.json
    with open('data/series.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2, ensure_ascii=False)
    
    print(f"\nUpdated {updated_count} out of {len(data['series'])} series.")

if __name__ == "__main__":
    print("Updating movies...")
    update_movies()
    print("\nUpdating series...")
    update_series()
    print("\nUpdate complete!")
