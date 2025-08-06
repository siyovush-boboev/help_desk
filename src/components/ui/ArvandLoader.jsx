const ArvandLoader = ({ size = 200, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size} // Логотип теперь симметричный, поэтому ширина и высота равны
      viewBox="0 0 200 200"
      className={className}
    >
      <style>
        {`
          .arvand-logo-pulse {
            animation: arvand-pulse 2.2s ease-in-out infinite;
            transform-origin: center;
          }
          @keyframes arvand-pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.3);
              opacity: 0.6;
            }
          }
          .arvand-logo-text {
            font-family: 'Times New Roman', serif; /* Используем шрифт с засечками, как в лого */
            letter-spacing: 0.2em; /* Увеличиваем расстояние между буквами */
            paint-order: stroke;
            stroke: #fff; /* Белая обводка, чтобы текст не сливался с ромбами */
            stroke-width: 1px;
            stroke-linecap: butt;
            stroke-linejoin: miter;
          }
        `}
      </style>

      <g fill="#009FA3">
        {/* --- ВЕРХНЯЯ ЧАСТЬ РОМБА --- */}
        {/* Самый верхний ромб */}
        <polygon points="100,24 108,32 100,40 92,32" className="arvand-logo-pulse" style={{ animationDelay: '0.4s' }} />
        {/* Ряд из 3 ромбов */}
        <polygon points="84,40 92,48 84,56 76,48" className="arvand-logo-pulse" style={{ animationDelay: '0.3s' }} />
        <polygon points="100,40 108,48 100,56 92,48" className="arvand-logo-pulse" style={{ animationDelay: '0.2s' }} />
        <polygon points="116,40 124,48 116,56 108,48" className="arvand-logo-pulse" style={{ animationDelay: '0.3s' }} />
        {/* Ряд из 5 ромбов */}
        <polygon points="68,56 76,64 68,72 60,64" className="arvand-logo-pulse" style={{ animationDelay: '0.4s' }} />
        <polygon points="84,56 92,64 84,72 76,64" className="arvand-logo-pulse" style={{ animationDelay: '0.2s' }} />
        <polygon points="100,56 108,64 100,72 92,64" className="arvand-logo-pulse" style={{ animationDelay: '0.1s' }} />
        <polygon points="116,56 124,64 116,72 108,64" className="arvand-logo-pulse" style={{ animationDelay: '0.2s' }} />
        <polygon points="132,56 140,64 132,72 124,64" className="arvand-logo-pulse" style={{ animationDelay: '0.4s' }} />

        {/* --- ТЕКСТ И МАЛЕНЬКИЕ РОМБЫ (СТАТИЧНЫЕ) --- */}
        <text x="100" y="103" textAnchor="middle" fontSize="18" fill="#009FA3" className="arvand-logo-text">
          АРВАНД
        </text>
        {/* Маленькие ромбики между буквами */}
        <polygon points="79,98 81,100 79,102 77,100" />
        <polygon points="99.5,98 101.5,100 99.5,102 97.5,100" />
        <polygon points="120,98 122,100 120,102 118,100" />
        <polygon points="58.5,98 60.5,100 58.5,102 56.5,100" />
        <polygon points="140.5,98 142.5,100 140.5,102 138.5,100" />
        {/* --- НИЖНЯЯ ЧАСТЬ РОМБА --- */}
        {/* Ряд из 5 ромбов */}
        <polygon points="68,128 76,136 68,144 60,136" className="arvand-logo-pulse" style={{ animationDelay: '0.4s' }} />
        <polygon points="84,128 92,136 84,144 76,136" className="arvand-logo-pulse" style={{ animationDelay: '0.2s' }} />
        <polygon points="100,128 108,136 100,144 92,136" className="arvand-logo-pulse" style={{ animationDelay: '0.1s' }} />
        <polygon points="116,128 124,136 116,144 108,136" className="arvand-logo-pulse" style={{ animationDelay: '0.2s' }} />
        <polygon points="132,128 140,136 132,144 124,136" className="arvand-logo-pulse" style={{ animationDelay: '0.4s' }} />
        {/* Ряд из 3 ромбов */}
        <polygon points="84,144 92,152 84,160 76,152" className="arvand-logo-pulse" style={{ animationDelay: '0.3s' }} />
        <polygon points="100,144 108,152 100,160 92,152" className="arvand-logo-pulse" style={{ animationDelay: '0.2s' }} />
        <polygon points="116,144 124,152 116,160 108,152" className="arvand-logo-pulse" style={{ animationDelay: '0.3s' }} />
        {/* Самый нижний ромб */}
        <polygon points="100,160 108,168 100,176 92,168" className="arvand-logo-pulse" style={{ animationDelay: '0.4s' }} />
      </g>
    </svg>
  );
};

export default ArvandLoader;