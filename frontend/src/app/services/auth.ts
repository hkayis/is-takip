import { Service, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
export interface LoginResponse{
    token: string;
    username: string;
    expiresAt: string;

}

@Service()
export class Auth {

    private http= inject(HttpClient);
    private readonly apiUrl= environment.apiUrl;

    login(username: string, password: string){
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`,{
            username,
            password,

        });
    }
    girisYapildi=signal(!!localStorage.getItem('token'));

    tokenKaydet(token: string){
        localStorage.setItem('token', token);
        this.girisYapildi.set(true);

    }

    cikis(){
        localStorage.removeItem('token');
        this.girisYapildi.set(false);
    }
}
