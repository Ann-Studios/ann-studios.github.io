// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Define types for our data
interface Game {
  id: number;
  title: string;
  description: string;
  image: string;
  status: string;
}

const App: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);

  const games: Game[] = [
    {
      id: 1,
      title: "Turkey Run",
      description: "You're a turkey and it's Thanksgiving! Escape from humans and predators! Or else you'll be dinner!",
      image: "imgs/goose-8740266_1280.jpg",
      status: "coming soon"
    },
    {
      id: 2,
      title: "Shadows of all Hallows",
      description: "The history of Halloween is reimagined with this fun game! Become the knight the town needs!",
      image: "imgs/knight-7169531_1280.jpg",
      status: "coming soon"
    },
    {
      id: 3,
      title: "Love Letter",
      description: "It's Valentine's day and Cupid has a crush. Help him deliver the citizens' letters to their loved ones before time runs out!",
      image: "imgs/sculpture-3448975_1280.jpg",
      status: "coming soon"
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % games.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [games.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % games.length);
  }, [games.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + games.length) % games.length);
  }, [games.length]);

  const openModal = useCallback((game: Game) => {
    setCurrentGame(game);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentGame(null);
  }, []);

  return (
    <div className="App">
      <Header />
      
      <div className="slider">
        <div className="list">
          {games.map((game, index) => (
            <div 
              key={game.id} 
              className={`item ${index === currentSlide ? 'active' : ''}`}
            >
              <img src={game.image} alt={game.title} />
              <div className="content">
                <p>{game.status}</p>
                <h2>{game.title}</h2>
                <p>{game.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="arrows">
          <button id="prev" title="prev" onClick={prevSlide}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <button id="next" title="next" onClick={nextSlide}>
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>

        <div className="thumbnail">
          {games.map((game, index) => (
            <div 
              key={game.id} 
              className={`item ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            >
              <img src={game.image} alt={game.title} />
              <div className="content">
                <p className="game-name">{game.title}</p>
                <div className="button-row">
                  <a 
                    href="#" 
                    className="watch-trailer" 
                    aria-label="trailer"
                    onClick={(e) => {
                      e.preventDefault();
                      openModal(game);
                    }}
                  >
                    <i className="fa-solid fa-video"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && currentGame && (
        <GameModal game={currentGame} onClose={closeModal} />
      )}

      <GoogleAnalytics />
    </div>
  );
};

const Header: React.FC = () => {
  return (
    <header>
      <div className="logo">
        <a href="#">Ann Studios</a>
      </div>
      <div className="gametab">
        <a href="./games.html" target="_blank" rel="noopener noreferrer">Games</a>
      </div>
      <div className="social-icons-sidebar">
        <a href="/other pages/redirects/facebook.html" rel="noopener" title="Facebook" target="_blank">
          <i className="fab fa-facebook-f"></i>
        </a>
        <a href="/other pages/redirects/tiktok.html" rel="noopener" title="Tiktok" target="_blank">
          <i className="fab fa-tiktok"></i>
        </a>
        <a href="/other pages/redirects/instagram.html" rel="noopener" title="Instagram" target="_blank">
          <i className="fab fa-instagram"></i>
        </a>
      </div>
    </header>
  );
};

interface GameModalProps {
  game: Game;
  onClose: () => void;
}

const GameModal: React.FC<GameModalProps> = ({ game, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>{game.title}</h2>
        <p>{game.description}</p>
        <div className="modal-actions">
          <button className="btn">Watch Trailer</button>
          <button className="btn">Learn More</button>
        </div>
      </div>
    </div>
  );
};

const GoogleAnalytics: React.FC = () => {
  useEffect(() => {
    // Google Analytics script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = 'https://www.googletagmanager.com/gtag/js?id=AW-16687754010';
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'AW-16687754010');
      gtag('event', 'conversion', {
        'send_to': 'AW-16687754010/g2C0CIH9ydEZEJrWq5U-'
      });
    `;
    document.head.appendChild(script2);

    // Google Tag Manager script
    const script3 = document.createElement('script');
    script3.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-PF6M4VXH');
    `;
    document.head.appendChild(script3);

    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
      document.head.removeChild(script3);
    };
  }, []);

  return (
    <>
      <noscript>
        <iframe 
          src="https://www.googletagmanager.com/ns.html?id=GTM-KXT8PGL6" 
          height="0" 
          width="0" 
          style={{display: 'none', visibility: 'hidden'}}
          title="Google Tag Manager"
        ></iframe>
      </noscript>
      <noscript>
        <iframe 
          src="https://www.googletagmanager.com/ns.html?id=GTM-PF6M4VXH" 
          height="0" 
          width="0" 
          style={{display: 'none', visibility: 'hidden'}}
          title="Google Tag Manager"
        ></iframe>
      </noscript>
    </>
  );
};

export default App;