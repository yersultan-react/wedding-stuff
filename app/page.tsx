'use client'
import { useState, useRef, useEffect } from 'react';

declare global {
  interface Window {
    storage: {
      list(prefix: string, traverse?: boolean): Promise<{ keys: string[] }>;
      get(key: string, traverse?: boolean): Promise<{ value?: string } | null>;
      set(key: string, value: string, traverse?: boolean): Promise<boolean>;
    };
  }
}

export default function Page() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [attendance, setAttendance] = useState<'yes' | 'maybe' | 'no'>('yes');
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  type Submission = {
    id: number;
    name: string;
    message: string;
    attendance: 'yes' | 'maybe' | 'no';
    date: string;
  };
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Загрузка тілектер при загрузке страницы
 useEffect(() => {
  const loadSubmissions = async () => {
    try {
      // Проверяем доступность window.storage (только на claude.ai)
      if (typeof window !== 'undefined' && window.storage) {
        // Claude.ai storage
        const result = await window.storage.list('submission:', true);
        if (result && result.keys && result.keys.length > 0) {
          const loadedSubmissions: Submission[] = [];
          
          for (const key of result.keys) {
            try {
              const data = await window.storage.get(key, true);
              if (data && data.value) {
                const submission = JSON.parse(data.value);
                loadedSubmissions.push(submission);
              }
            } catch (error) {
              console.log('Ключ не найден:', key);
            }
          }
          
          loadedSubmissions.sort((a, b) => b.id - a.id);
          setSubmissions(loadedSubmissions);
        }
      } else {
        // Fallback на localStorage для локальной разработки
        const existingData = localStorage.getItem('submissions');
        if (existingData) {
          const allSubmissions = JSON.parse(existingData);
          setSubmissions(allSubmissions);
        }
      }
    } catch (error) {
      console.log('Ошибка загрузки:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  loadSubmissions();
}, []);

useEffect(() => {
  const playAudio = async () => {
    if (audioRef.current) {
      try {
        // Попытка автоматического воспроизведения
        audioRef.current.volume = 0.5; // Громкость 50%
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('Autoplay prevented - user interaction needed');
        // Если автовоспроизведение заблокировано, попробуем при первом клике
        const playOnInteraction = async () => {
          try {
            await audioRef.current?.play();
            setIsPlaying(true);
            document.removeEventListener('click', playOnInteraction);
          } catch (e) {
            console.log('Failed to play');
          }
        };
        document.addEventListener('click', playOnInteraction);
      }
    }
  };
  playAudio();
}, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  useEffect(() => {
  setIsVisible(true);
}, []);

// Замените style в <style> блоке на это:

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const newSubmission = {
    id: Date.now(),
    name: name,
    message: message,
    attendance: attendance,
    date: new Date().toLocaleString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  
  try {
    // Отправка на email через API
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSubmission),
    });

    if (response.ok) {
      // Очистить форму
      setName('');
      setMessage('');
      setAttendance('yes');
      
      alert(`Рақмет! ${newSubmission.name}, сіздің тілегіңіз қабылданды!`);
    } else {
      alert('Қате! Қайталап көріңіз.');
    }
  } catch (error) {
    console.error('Ошибка отправки:', error);
    alert('Қате! Қайталап көріңіз.');
  }
};

  // Обратный отсчет
  useEffect(() => {
    const targetDate = new Date('2025-12-23T19:00:00').getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Playfair Display', serif;
    background: #fafafa;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }

  .animate-fade-in {
    animation: fadeIn 1s ease-out forwards;
  }

  .animate-scale-in {
    animation: scaleIn 0.6s ease-out forwards;
  }

  .music-btn {
    position: fixed;
    bottom: 80px;
    left: 20px;
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
    border: none;
    padding: 14px 32px;
    borderRadius: 50px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 8px 25px rgba(34, 197, 94, 0.5);
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 1000;
    transition: all 0.3s ease;
    font-family: 'Playfair Display', serif;
  }

  .music-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 35px rgba(34, 197, 94, 0.6);
  }

  .play-icon {
    width: 0;
    height: 0;
    border-left: 12px solid white;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
  }
`}</style>


      <audio ref={audioRef} loop>
        <source src="/wedding-music.mp3" type="audio/mpeg" />
      </audio>

      <div style={{ 
        minHeight: '100vh', 
        background: '#ffffff', 
        maxWidth: '480px', 
        margin: '0 auto',
        boxShadow: '0 0 40px rgba(0,0,0,0.08)',
        fontFamily: "'Playfair Display', serif"
      }}>
        
       {/* СЕКЦИЯ 1: Главная с фото */}
<div style={{ 
  position: 'relative', 
  minHeight: '100vh',
  background: '#f8f5f0',
  paddingTop: '100px',
  paddingBottom: '60px'
}}>
  {/* Цветы сверху */}
  <div style={{
    position: 'absolute',
    top: '-30px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '350px',
    height: '180px',
    zIndex: 10
  }}>
    <img 
      src="/flowers.png" 
      alt="flowers"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
      }}
    />
  </div>

  {/* Фото */}
{/* Фото */}
<div 
  className="animate-scale-in"
  style={{
    width: '92%',
    maxWidth: '420px',
    margin: '0 auto',
    aspectRatio: '9/11',
    borderRadius: '24px',
    overflow: 'hidden',
    position: 'relative',
    marginTop: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    opacity: 0,
    animationDelay: '0.3s'
  }}>
    <img 
      src="/wedding-photo.jpg" 
      alt="Wedding photo" 
      style={{ 
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block'
      }} 
    />
    
    {/* Градиент снизу фото */}
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '40%',
      background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 30%, transparent 100%)',
      pointerEvents: 'none'
    }}></div>
  </div>

  {/* Заголовок */}
 {/* Заголовок */}
<h1 
  className="animate-fade-in-up"
  style={{
    fontSize: '20px',
    fontWeight: '700',
    color: '#3d5a2a',
    textAlign: 'center',
    margin: '50px 20px 35px',
    letterSpacing: '2px',
    fontFamily: "'Playfair Display', serif",
    opacity: 0,
    animationDelay: '0.6s'
  }}>
     ҚҰРМЕТТІ <br/>
     АҒАЙЫН-ТУЫС, БАУЫРЛАР, НАҒАШЫ-ЖИЕН, БӨЛЕЛЕР, ҚҰДА-ЖЕКЖАТ, ДОС-ЖАРАНДАР, ӘРІПТЕСТЕР, КӨРШІЛЕР! 
  </h1>

  {/* Текст */}
 <p 
  className="animate-fade-in-up"
  style={{
    fontSize: '18px',
    lineHeight: '1.9',
    color: '#555',
    textAlign: 'center',
    padding: '0 35px',
    marginBottom: '40px',
    maxWidth: '500px',
    margin: '0 auto',
    fontWeight: '400',
    opacity: 0,
    animationDelay: '0.9s'
  }}>
    Сіздерді ұлымыз Сапарәлі мен келініміз Гүлназдың шаңырақ көтеру тойына арналған салтанатты ақ дастарханымыздың қадірлі қонағы болуға шақырамыз.
  </p>

  {/* Кнопка музыки */}
  <button onClick={toggleMusic} className="music-btn">
    <div className="play-icon"></div>
    <span>Әуен қосу</span>
  </button>
</div>

{/* СЕКЦИЯ 2: Детали тоя */}
<div style={{ 
  position: 'relative',
  padding: '0',
  background: '#fff',
  marginTop: '-60px'
}}>
  {/* Волнистая рамка */}
<div 
  className="animate-fade-in"
  style={{
    background: '#ffffff',
    margin: '0 20px',
    padding: '80px 40px 50px',
    borderRadius: '120px / 80px',
    boxShadow: '0 40px 80px rgba(0,0,0,0.12), 0 20px 40px rgba(0,0,0,0.08), 0 10px 20px rgba(0,0,0,0.05)',
    border: 'none',
    position: 'relative',
    textAlign: 'center',
    maxWidth: '420px',
    marginLeft: 'auto',
    marginRight: 'auto',
    opacity: 0,
    animationDelay: '0.4s'
  }}>
     <img 
      src="/flowers.png" 
      alt="flowers"
      style={{
        width: '200px',
        height: 'auto',
        margin: '0 auto',
        display: 'block',
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))',
        
      }}
    />
    
    {/* Заголовок */}
    <h2 style={{ 
      fontSize: '38px', 
      fontWeight: '700', 
      color: '#1a1a1a', 
      marginBottom: '50px',
      letterSpacing: '0.5px'
    }}>
    
    </h2>

    {/* Той иелері */}
    <div style={{ marginBottom: '45px' }}>
        <p
    style={{
      fontSize: '15px',
      color: '#000',        // black text
      marginBottom: '12px',
      fontWeight: '700',    // bold
      letterSpacing: '0.5px',
    }}
  >
    ТОЙ ИЕЛЕРІ:
  </p>
      <p style={{ 
        fontSize: '32px', 
        fontWeight: '700', 
        color: '#1a1a1a',
        letterSpacing: '1px'
      }}>
        Нұралы - Жанар
      </p>
    </div>

    {/* Тойдың басталу уақыты */}
<div style={{ marginBottom: '45px' }}>
  <p style={{ 
    fontSize: '15px', 
    color: '#888', 
    marginBottom: '12px', 
    fontWeight: '500',
    letterSpacing: '0.5px'
  }}>
    Беташардың басталу уақыты:
  </p>
  <p style={{ 
    fontSize: '26px', 
    fontWeight: '700', 
    color: '#1a1a1a',
    letterSpacing: '0.5px',
    marginBottom: '25px'
  }}>
    23.12.2025 / сағат 18:00
  </p>
  
  <p style={{ 
    fontSize: '15px', 
    color: '#888', 
    marginBottom: '12px', 
    fontWeight: '500',
    letterSpacing: '0.5px'
  }}>
    Тойдың басталу уақыты:
  </p>
  <p style={{ 
    fontSize: '26px', 
    fontWeight: '700', 
    color: '#1a1a1a',
    letterSpacing: '0.5px'
  }}>
    23.12.2025 / сағат 19:00
  </p>
</div>

    {/* Обратный отсчет */}
    <div style={{ marginBottom: '45px' }}>
      <p style={{ 
        fontSize: '15px', 
        color: '#888', 
        marginBottom: '20px', 
        fontWeight: '500',
        letterSpacing: '0.5px'
      }}>
        Тойдың басталуына қалды:
      </p>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '18px', 
        flexWrap: 'wrap' 
      }}>
        {[
          { value: timeLeft.days, label: 'күн' },
          { value: timeLeft.hours, label: 'сағат' },
          { value: timeLeft.minutes, label: 'минут' },
          { value: timeLeft.seconds, label: 'секунд' }
        ].map((item, index) => (
          <div key={index} style={{
            border: '3px solid #22c55e',
            borderRadius: '50%',
            width: '75px',
            height: '75px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)',
            background: '#fff'
          }}>
            <span style={{ 
              fontSize: '26px', 
              fontWeight: '700', 
              color: '#1a1a1a' 
            }}>
              {item.value}
            </span>
            <span style={{ 
              fontSize: '11px', 
              color: '#666',
              marginTop: '2px'
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* Мекен-жайы */}
    <div style={{ marginBottom: '40px' }}>
      <p style={{ 
        fontSize: '15px', 
        color: '#888', 
        marginBottom: '12px', 
        fontWeight: '500',
        letterSpacing: '0.5px'
      }}>
        Тойдың мекен-жайы:
      </p>
      <p style={{ 
        fontSize: '19px', 
        fontWeight: '600', 
        color: '#1a1a1a', 
        marginBottom: '6px',
        letterSpacing: '0.3px'
      }}>
        Түркістан облысы, Қазығұрт ауданы
      </p>
      <p style={{ 
        fontSize: '19px', 
        fontWeight: '600', 
        color: '#1a1a1a',
        letterSpacing: '0.3px'
      }}>
        Қазығұрт - Нұр 2
      </p>
    </div>

    {/* Кнопка карты */}
    <button 
      onClick={() => window.open('https://2gis.kz/shymkent/firm/70000001082009034', '_blank')}
      style={{
        width: '100%',
        maxWidth: '340px',
        padding: '18px 24px',
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        fontSize: '18px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '10px',
        fontFamily: "'Playfair Display', serif",
        boxShadow: '0 8px 24px rgba(34, 197, 94, 0.35)',
        transition: 'all 0.3s ease',
        letterSpacing: '0.5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(34, 197, 94, 0.45)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(34, 197, 94, 0.35)';
      }}
    >
      Карта арқылы ашу
    </button>
  </div>
</div>

{/* СЕКЦИЯ 3: Текст */}
<div style={{ padding: '60px 20px', background: '#fff', textAlign: 'center' }}>
  <div style={{ marginBottom: '30px' }}>
    <div style={{
      width: '30px',
      height: '4px',
      background: '#22c55e',
      margin: '0 auto 8px',
      borderRadius: '2px'
    }}></div>
  </div>

  <p style={{
    fontSize: '18px',
    lineHeight: '1.8',
    color: '#333',
    marginBottom: '25px',
    padding: '0 20px'
  }}>
    Құрметті жақындық, жуырда біздің өмірімізге ең бақытты күндердің бірі болмақ!
  </p>

  <p style={{
    fontSize: '18px',
    lineHeight: '1.8',
    color: '#333',
    marginBottom: '25px',
    padding: '0 20px'
  }}>
    Сол бақытты күнде сізді жанымыздан көріп, қуанышымызбен бөліскіміз келеді!
  </p>

  <p style={{
    fontSize: '18px',
    lineHeight: '1.8',
    color: '#333',
    marginBottom: '50px',
    padding: '0 20px'
  }}>
    Тойымыздың салтанатты дастарханында сізді күтеміз!
  </p>

  <h3 style={{
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '40px',
    textAlign: 'center'
  }}>
    Құрметпен
  </h3>

  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '40px',
    maxWidth: '700px',
    margin: '0 auto 60px'
  }}>
    
    {/* --- 1 человек --- */}
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        background: '#e8e8e8',
        margin: '0 auto 15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <svg width="70" height="70" viewBox="0 0 24 24" fill="#999">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>

      <p style={{
        fontSize: '20px',
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: '12px'
      }}>
        Сапарәлі
      </p>

      <a href="https://www.instagram.com/saparaly7279?igsh=MTVkYTd0ajJlYm0ybA==" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 18px',
        border: '2px solid #e8e8e8',
        borderRadius: '8px',
        color: '#555',
        textDecoration: 'none',
        fontSize: '15px'
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#E4405F">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.4s-.644-1.44-1.439-1.44z"/>
        </svg>
        @saparaly7279
      </a>
    </div>

    {/* --- 2 человек --- */}
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        background: '#e8e8e8',
        margin: '0 auto 15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <svg width="70" height="70" viewBox="0 0 24 24" fill="#999">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>

      <p style={{
        fontSize: '20px',
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: '12px'
      }}>
        Гүлназ
      </p>

      <a href="https://www.instagram.com/kairatvnaaaa?igsh=ajZuZmY2eHQ5cXYz" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 18px',
        border: '2px solid #e8e8e8',
        borderRadius: '8px',
        color: '#555',
        textDecoration: 'none',
        fontSize: '15px'
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#E4405F">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.4s-.644-1.44-1.439-1.44z"/>
        </svg>
        @kairatvnaaaa
      </a>
    </div>
  </div>
</div>

{/* СЕКЦИЯ 4: Форма */}
<div style={{ padding: '60px 20px', background: '#fafafa' }}>
  <h3 style={{
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: '40px',
    lineHeight: '1.5',
    fontFamily: "'Playfair Display', serif"
  }}>
    Құрметті қонақ,<br/>
    тойға келетініңізді растаңыз:
  </h3>

  <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
    <div style={{ marginBottom: '35px' }}>
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '18px',
        cursor: 'pointer',
        fontSize: '17px'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: '2px solid #22c55e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: attendance === 'yes' ? '#22c55e' : 'white',
          transition: 'all 0.3s ease'
        }}>
          {attendance === 'yes' && (
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'white'
            }}></div>
          )}
        </div>
        <input
          type="radio"
          name="attendance"
          value="yes"
          checked={attendance === 'yes'}
          onChange={(e) => setAttendance(e.target.value as 'yes' | 'maybe' | 'no')}
          style={{ display: 'none' }}
        />
        <span style={{ color: '#1a1a1a', fontWeight: '500' }}>Иә, әзім барамын!</span>
      </label>

      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '18px',
        cursor: 'pointer',
        fontSize: '17px'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: '2px solid #22c55e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: attendance === 'maybe' ? '#22c55e' : 'white',
          transition: 'all 0.3s ease'
        }}>
          {attendance === 'maybe' && (
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'white'
            }}></div>
          )}
        </div>
        <input
          type="radio"
          name="attendance"
          value="maybe"
          checked={attendance === 'maybe'}
          onChange={(e) => setAttendance(e.target.value as 'yes' | 'maybe' | 'no')}
          style={{ display: 'none' }}
        />
        <span style={{ color: '#1a1a1a', fontWeight: '500' }}>Жұбайыммен бірге барамын</span>
      </label>

      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        fontSize: '17px'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: '2px solid #22c55e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: attendance === 'no' ? '#22c55e' : 'white',
          transition: 'all 0.3s ease'
        }}>
          {attendance === 'no' && (
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'white'
            }}></div>
          )}
        </div>
        <input
          type="radio"
          name="attendance"
          value="no"
          checked={attendance === 'no'}
          onChange={(e) => setAttendance(e.target.value as 'yes' | 'maybe' | 'no')}
          style={{ display: 'none' }}
        />
        <span style={{ color: '#1a1a1a', fontWeight: '500' }}>Өкінішке орай, келе алмаймын</span>
      </label>
    </div>

   <div style={{ marginBottom: '25px' }}>
  <label style={{ 
    display: 'block', 
    fontSize: '15px', 
    color: '#666', 
    marginBottom: '10px',
    fontWeight: '500'
  }}>
    Аты-жөніңіз:
  </label>
  <input
    type="text"
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="Аты-жөніңіз"
    required
    style={{
      width: '100%',
      padding: '16px 18px',
      fontSize: '16px',
      border: '1.5px solid #d1d5db',
      borderRadius: '12px',
      outline: 'none',
      fontFamily: "'Playfair Display', serif",
      transition: 'border-color 0.3s ease',
      background: 'white',
      color: '#000'
    }}
    onFocus={(e) => e.currentTarget.style.borderColor = '#22c55e'}
    onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
  />
</div>

<div style={{ marginBottom: '35px' }}>
  <label style={{ 
    display: 'block', 
    fontSize: '15px', 
    color: '#666', 
    marginBottom: '10px',
    fontWeight: '500'
  }}>
    Той иелеріне тілегіңіз:
  </label>
  <textarea
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    placeholder="Тілегіңізді осында жазыңыз"
    required
    rows={5}
    style={{
      width: '100%',
      padding: '16px 18px',
      fontSize: '16px',
      border: '1.5px solid #d1d5db',
      borderRadius: '12px',
      outline: 'none',
      resize: 'vertical',
      fontFamily: "'Playfair Display', serif",
      transition: 'border-color 0.3s ease',
      background: 'white',
      color: '#000'
    }}
    onFocus={(e) => e.currentTarget.style.borderColor = '#22c55e'}
    onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
  />
</div>

    <button
      type="submit"
      style={{
        width: '100%',
        padding: '18px',
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        fontSize: '19px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(34, 197, 94, 0.4)',
        fontFamily: "'Playfair Display', serif",
        transition: 'all 0.3s ease',
        letterSpacing: '0.5px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(34, 197, 94, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(34, 197, 94, 0.4)';
      }}
    >
      Жіберу
    </button>
  </form>
</div>

{/* Футер - Тілектер */}

      </div>
    </>
  );
}