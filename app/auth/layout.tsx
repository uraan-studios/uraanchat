import React from 'react';

const AuthLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {


  return (
    <main className="min-h-screen h-full flex tex-fore">

        (<div className="h-screen flex-grow flex items-center justify-center">
          {children}
        </div>)
      
    </main>
  );
};

export default AuthLayout;