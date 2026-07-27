import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Job{
    id: number;
    title: string;
    createdAt: string;
    deadline: string;
    status: string;
    stage: string | null;

}

export interface JobHistory{
    id: number;
    oldStatus: string | null;
    newStatus: string;
    oldStage: string | null;
    newStage: string | null;
    changedAt: string;
    note: string | null;


}

export interface JobDetail {
    id: number;
    title: string;
    description: string;
    status: string;
    stage: string | null;
    createdAt: string;
    deadline: string;
    completedAt: string | null;
    history: JobHistory[];
}

@Service()

export class JobApi {
    private http = inject(HttpClient);
    private readonly apiUrl= 'http://localhost:5227';

    getAll(){
        return this.http.get<Job[]>(`${this.apiUrl}/jobs`);
    }
    create(dto: { title: string; description: string; deadline: string }) {
        return this.http.post(`${this.apiUrl}/jobs`, dto);
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
