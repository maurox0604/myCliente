import React, { createContext, useState } from 'react';

export const HeladoContext = createContext();

export const HeladoProvider = ({ children }) => {
   // const [badgeCount, setBadgeCount] = useState(0);

    return (
        <HeladoContext.Provider >
            {children}
        </HeladoContext.Provider>
    );
};