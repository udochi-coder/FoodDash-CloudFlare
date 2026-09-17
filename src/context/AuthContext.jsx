import { createContext, useContext, useState } from "react";
import { login as loginAPI, register as registerAPI } from '../api/endpoints'


const AuthContext  =  createContext(null);


export function AuthProvider({children}) {

    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')  || 'null'));

    const login = async(email, password) => {

        const { data } = await loginAPI({email, password});
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        return data.user;
    }

    const register = async(name, email, password) => {

        const { data } = await registerAPI({name, email, password});

        return data;
    }

    const logout = () => {

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    }


    return (

        <AuthContext.Provider value={{ user, login, logout, register, isStaff: user?.role === 'staff'}}>

            {children}
        </AuthContext.Provider>
    );
}


// This hook intentionally lives beside its provider so consumers share one
// context instance. It is not a Fast Refresh component export.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
