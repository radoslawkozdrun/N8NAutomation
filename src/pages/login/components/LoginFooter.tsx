import React from 'react';

const LoginFooter = () => {
  const currentYear = new Date()?.getFullYear();

  return (
    <div className="mt-8 text-center space-y-4">
      {/* Sign up link */}
      <p className="text-gray-500 text-sm">
        Don't have an account ?{' '}
        <a href="/signup" className="text-blue-600 hover:text-blue-700 transition-colors font-medium">
          Signup now
        </a>
      </p>

      {/* Copyright */}
      <p className="text-gray-500 text-sm">
        © {currentYear} FlowCraft. Crafted with{' '}
        <span className="text-red-500">❤</span> by DEV Radoslaw Kozdrun
      </p>
    </div>
  );
};

export default LoginFooter;