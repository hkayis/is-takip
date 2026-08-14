import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { JobApi, Job } from './job-api';

type YukDurumu= 'bos' | 'yukleniyor' | 'hazir' | 'hata';

@Injectable ({providedIn: 'root'})
export class JobStore {
    private api = inject(JobApi);

    private _isler = signal<Job[]>([]);
    private _durum =signal<YukDurumu>('bos');

    isler= this._isler.asReadonly();
    durum=this._durum.asReadonly();

    yukle(){
        if (this._durum() === 'hazir' || this._durum() === 
        'yukleniyor') return;
           this.yenile();
    }

    yenile(){
        this._durum.set('yukleniyor');
        this.api.getAll().subscribe({
            next: (liste) => {this._isler.set(liste)
                this._durum.set('hazir');
            },
            error: () => this._durum.set('hata'),
        });
    }

    olustur(dto: Parameters<JobApi['create']>[0]){
        return this.api.create(dto).pipe(tap(()=> this.yenile()));
    }

    guncelle(id:number, dto: Parameters<JobApi['update']>[1]){
        return this.api.update(id,dto).pipe(tap(()=>
        this.yenile()));
    }

    sil(id: number) {
        return this.api.delete(id).pipe(tap(()=>
        this.yenile()));
    }

    durumDegistir(id: number, dto:
        Parameters<JobApi['changeStatus']>[1]){
            return this.api.changeStatus(id,dto).pipe(tap(()=>
            this.yenile()));
        }
}
