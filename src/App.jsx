import { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [currentDog, setCurrentDog] = useState(null);
  const [banList, setBanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allBreeds, setAllBreeds] = useState([]);

  // Fetch all available breeds on component mount
  useEffect(() => {
    fetchAllBreeds();
  }, []);

  const fetchAllBreeds = async () => {
    try {
      const response = await fetch('https://dog.ceo/api/breeds/list/all');
      const data = await response.json();
      if (data.status === 'success') {
        const breeds = Object.keys(data.message);
        setAllBreeds(breeds);
      }
    } catch (error) {
      console.error('Failed to fetch breeds:', error);
    }
  };

  const fetchRandomDog = async () => {
    setLoading(true);
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch('https://dog.ceo/api/breeds/image/random');
        const data = await response.json();
        
        if (data.status === 'success') {
          const imageUrl = data.message;
          const breed = extractBreedFromUrl(imageUrl);
          const formattedBreed = formatBreedName(breed);
          const size = getRandomSize();
          const temperament = getRandomTemperament();
          
          // Check if this breed is banned
          if (!banList.includes(formattedBreed) && !banList.includes(size) && !banList.includes(temperament)) {
            setCurrentDog({
              image: imageUrl,
              breed: formattedBreed,
              size: size,
              temperament: temperament
            });
            setLoading(false);
            return;
          }
        }
        attempts++;
      } catch (error) {
        console.error('API call failed:', error);
        attempts++;
      }
    }
    
    setLoading(false);
    alert('Unable to find a dog that matches your preferences. Try removing some items from the ban list!');
  };

  const extractBreedFromUrl = (url) => {
    const parts = url.split('/');
    const breedIndex = parts.findIndex(part => part === 'breeds') + 1;
    if (breedIndex > 0 && breedIndex < parts.length) {
      return parts[breedIndex];
    }
    return 'mixed';
  };

  const formatBreedName = (breed) => {
    return breed.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getRandomSize = () => {
    const sizes = ['Small', 'Medium', 'Large', 'Extra Large'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  const getRandomTemperament = () => {
    const temperaments = [
      'Friendly', 'Energetic', 'Calm', 'Playful', 'Loyal', 
      'Intelligent', 'Gentle', 'Alert', 'Confident', 'Affectionate'
    ];
    return temperaments[Math.floor(Math.random() * temperaments.length)];
  };

  const toggleBanItem = (item) => {
    setBanList(prevBanList => {
      if (prevBanList.includes(item)) {
        return prevBanList.filter(bannedItem => bannedItem !== item);
      } else {
        return [...prevBanList, item];
      }
    });
  };

  return (
    <div className="whole-page">
      <h1>🐕 Discover Amazing Dogs! 🐕</h1>
      <p>Click the button below to discover a new dog breed. Click on any attribute to add it to your ban list!</p>
      
      <button 
        className="discover-button" 
        onClick={fetchRandomDog}
        disabled={loading}
      >
        {loading ? 'Finding Dog...' : '🎲 Discover New Dog!'}
      </button>

      {currentDog && (
        <div className="dog-card">
          <img
            className="dog-image"
            src={currentDog.image}
            alt={`${currentDog.breed} dog`}
          />
          <div className="dog-info">
            <div className="attribute">
              <strong>Breed: </strong>
              <span 
                className={`clickable-attribute ${banList.includes(currentDog.breed) ? 'banned' : ''}`}
                onClick={() => toggleBanItem(currentDog.breed)}
              >
                {currentDog.breed}
              </span>
            </div>
            <div className="attribute">
              <strong>Size: </strong>
              <span 
                className={`clickable-attribute ${banList.includes(currentDog.size) ? 'banned' : ''}`}
                onClick={() => toggleBanItem(currentDog.size)}
              >
                {currentDog.size}
              </span>
            </div>
            <div className="attribute">
              <strong>Temperament: </strong>
              <span 
                className={`clickable-attribute ${banList.includes(currentDog.temperament) ? 'banned' : ''}`}
                onClick={() => toggleBanItem(currentDog.temperament)}
              >
                {currentDog.temperament}
              </span>
            </div>
          </div>
        </div>
      )}

      {banList.length > 0 && (
        <div className="ban-list">
          <h3>🚫 Ban List</h3>
          <p>Click on any banned item to remove it from the ban list:</p>
          <div className="banned-items">
            {banList.map((item, index) => (
              <span
                key={index}
                className="banned-item"
                onClick={() => toggleBanItem(item)}
              >
                {item} ❌
              </span>
            ))}
          </div>
        </div>
      )}

      {!currentDog && !loading && (
        <div className="welcome-message">
          <p>Welcome! Click the "Discover New Dog!" button to start exploring amazing dog breeds!</p>
        </div>
      )}
    </div>
  );
}

export default App