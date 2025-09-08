import React from 'react';


const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Title and Description */}
      <h1 className="text-3xl font-semibold text-foreground mb-2">
        Witaj w OPIX
      </h1>
      <p className="text-muted-foreground text-lg">
        Zaloguj się do systemu zarządzania treścią RSS
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Zarządzaj artykułami z wykorzystaniem sztucznej inteligencji
      </p>
    </div>
  );
};

export default LoginHeader;