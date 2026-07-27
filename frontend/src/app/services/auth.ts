import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface LoginResponse{
    token: string;
    username: string;
    expiresAt: string;

}



@Service()
export class Auth {

    private http= inject(HttpClient);
    private readonly apiUrl= 'http://localhost:5227';

    login(username: string, password: string){
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`,{
            username,
            password,

        }); 
    }
}
