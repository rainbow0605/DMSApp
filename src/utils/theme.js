import { DefaultTheme } from 'react-native-paper';

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#075E54',
        accent: '#25D366',
        background: '#F6F6F6',
        surface: '#FFFFFF',
        text: '#333333',
        error: '#D32F2F',
        success: '#388E3C',
        warning: '#F57C00',
        info: '#1976D2',
        card: '#FFFFFF',
        disabled: '#BDBDBD',
        placeholder: '#9E9E9E',
    },
    roundness: 8,
};

export default theme;