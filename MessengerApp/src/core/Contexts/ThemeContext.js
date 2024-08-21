import React, { createContext, useState } from 'react';
import { ThemeProvider as PaperThemeProvider, DefaultTheme, DarkTheme } from 'react-native-paper';

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const theme = isDarkTheme ? DarkTheme : DefaultTheme;

  return (
    <ThemeContext.Provider value={{ toggleTheme }}>
      <PaperThemeProvider theme={theme}>{children}</PaperThemeProvider>
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
