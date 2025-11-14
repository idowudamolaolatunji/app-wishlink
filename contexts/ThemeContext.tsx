

import { ThemeContextType, ThemeString } from "@/utils/types";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";


export const ThemeContext = createContext<ThemeContextType>({
    currentTheme: "light",
    toggleTheme: () => {},
    isSystemTheme: false,
    useSystemTheme: () => {}
});

export const ThemeProvider = function({ children }: { children: React.ReactNode }) {
    const colorScheme = useColorScheme();
    const [isSystemTheme, setIsSystemTheme] = useState(true);
    const [theme, setTheme] = useState<ThemeString>("light");

    // GET THE STORE THEME DATA
    useEffect(function() {
        (async function() {
            try {
                const savedTheme = await AsyncStorage.getItem("theme");
                const parsedSavedTheme = JSON.parse(savedTheme!);

                if(parsedSavedTheme) {
                    // console.log(parsedSavedTheme)
                    setTheme(parsedSavedTheme.mode ?? "light");
                    setIsSystemTheme(parsedSavedTheme.system ?? false);
                }
            } catch(err: any) {
                console.log("Error loading theme", err);
            }
        })();
    }, []);

    // TOOGLE THEME
    const toggleTheme = function(newTheme: ThemeString) {
        const mode = {
            mode: newTheme,
            system: false
        };

        setTheme(newTheme);
        setIsSystemTheme(false);
        AsyncStorage.setItem("theme", JSON.stringify(mode))
    }

    // SET STSYEM THEME
    const useSystemTheme = function() {
        if(colorScheme) {
            const mode = {
                mode: colorScheme,
                system: true
            };
            
            setTheme(colorScheme as ThemeString);
            setIsSystemTheme(true)
            AsyncStorage.setItem("theme", JSON.stringify(mode))
        }
    }

    // UPDATE THEME IS SYSTEM THEM CHANGES
    useEffect(function() {
        if(isSystemTheme && colorScheme) {
            useSystemTheme();
        }
    }, [colorScheme]);


    const contextValue: ThemeContextType = {
        currentTheme: theme,
        toggleTheme,
        useSystemTheme,
        isSystemTheme,
    }

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useThemeContext = () => useContext(ThemeContext);