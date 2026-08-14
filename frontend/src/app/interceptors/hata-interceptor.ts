import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth';

export const hataInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);
  const snackBar= inject(MatSnackBar);
  const auth = inject(Auth);


  return next(req).pipe(
    catchError((err)=>{
      if(err.status===401){
        auth.cikis();
        router.navigate(['/login']);
        snackBar.open('Oturumun sona erdi, yeniden giriş yap', 'Tamam', {duration:4000});
      } else if (err.status===0){
        snackBar.open('Sunucuya ulaşılamıyor.', 'Tamam',{
          duration:4000});
      }else if(err.status >=500){
        snackBar.open('Sunucu hatası oluştu.', 'Tamam',{
          duration:4000
        });
      }
      else if(err.status ===429){
        snackBar.open(
          err.error?.message ?? 'Çok fazla istek gönderildi Lütfen biraz bekleyin',
          'Tamam',
          {duration:6000}
        );
      }
      return throwError(()=>err);
    })
  )
};
