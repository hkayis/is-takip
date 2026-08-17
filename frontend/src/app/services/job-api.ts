import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';


export interface Job{
    id: number;
    title: string;
    description:string;
    createdAt: string;
    deadline: string;
    completedAt: string | null;
    status: string;
    stage: string | null;
    priority: string;
    adam: number | null;
    gun: number | null;
    buyukluk: string;
    
}

export interface JobHistory{
    id: number;
    oldStatus: string | null;
    newStatus: string;
    oldStage: string | null;
    newStage: string | null;
    changedAt: string;
    note: string | null;
    changes: string | null;

}

export interface JobDetail {
    id: number;
    title: string;
    description: string;
    status: string;
    stage: string | null;
    priority: string;
    createdAt: string;
    deadline: string;
    completedAt: string | null;
    history: JobHistory[];
    adam: number | null;
    gun: number | null;
    buyukluk: string;
    not: string | null;
}

export interface AsamaSuresi {
  asama: string;
  ortalamaGun: number;
  toplamGun: number;
  isSayisi: number;
}

@Service()

export class JobApi {
    private http = inject(HttpClient);
    private readonly apiUrl= 'http://localhost:5227';

    getAll(){
        return this.http.get<Job[]>(`${this.apiUrl}/jobs`);
    }
    getAsamaSureleri() {
  return this.http.get<AsamaSuresi[]>(`${this.apiUrl}/reports/asama-sureleri`);
}
    create(dto: { id: number; title: string; description: string; deadline: string;
        priority: string; adam: number; gun: number; buyukluk:string | null;
    }) {
        return this.http.post(`${this.apiUrl}/jobs`, dto);
    }
    update(id: number, dto: {title: string; description: string; deadline:string;
        priority: string; adam: number; gun: number; buyukluk: string|null;not: string|null;}){
        return this.http.put(`${this.apiUrl}/jobs/${id}`, dto);
    }
    delete(id: number){
        return this.http.delete(`${this.apiUrl}/jobs/${id}`)
    }
    getById( id:number){
        return this.http.get<JobDetail>(`${this.apiUrl}/jobs/${id}`)
    }

    changeStatus( id: number, dto: {newStatus: string; newStage: string | null; note: string | null }){
        return this.http.patch(`${this.apiUrl}/jobs/${id}/status`,dto);
    }
}
