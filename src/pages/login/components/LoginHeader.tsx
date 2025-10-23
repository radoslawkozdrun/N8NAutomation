import React from 'react';


const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      {/* Welcome Illustration */}
      <div className="bg-gradient-to-r from-blue-300 to-purple-400 rounded-lg p-6 mb-6 relative overflow-hidden min-h-[140px]">
        <div className="relative z-10 text-left">
          <h1 className="text-white text-2xl font-medium mb-1">
            Welcome Back !
          </h1>
          <p className="text-white/90 text-sm">
            Sign in to continue to FlowCraft.
          </p>
        </div>

        {/* Person Illustration */}
        <div className="absolute right-4 top-4 bottom-4 flex items-center">
          <div className="relative">
            {/* Desk/Table */}
            <div className="w-20 h-3 bg-white/30 rounded-sm mb-1"></div>

            {/* Monitor */}
            <div className="w-8 h-6 bg-white/40 rounded-sm absolute right-6 -top-6 border border-white/30"></div>

            {/* Plant */}
            <div className="w-2 h-4 bg-green-400/60 rounded-full absolute left-2 -top-4"></div>
            <div className="w-1 h-2 bg-green-500/60 rounded-full absolute left-2.5 -top-6"></div>

            {/* Person */}
            <div className="absolute right-0 -top-8">
              {/* Head */}
              <div className="w-4 h-4 bg-orange-300 rounded-full mb-1"></div>
              {/* Body */}
              <div className="w-5 h-6 bg-orange-200 rounded-sm"></div>
              {/* Hair */}
              <div className="w-3 h-2 bg-orange-400 rounded-full absolute top-0 left-0.5"></div>
            </div>

            {/* Speech bubble */}
            <div className="w-4 h-3 bg-white/30 rounded absolute -top-2 right-8"></div>

            {/* Moon/Circle */}
            <div className="w-6 h-6 bg-white/20 rounded-full absolute -top-6 left-8"></div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LoginHeader;