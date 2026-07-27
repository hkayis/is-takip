import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-yeni-is-dialog',
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './yeni-is-dialog.html',
  styleUrl: './yeni-is-dialog.scss',
})
export class YeniIsDialog {
  private dialogRef = inject(MatDialogRef<YeniIsDialog>);

  baslik = '';
  aciklama = '';
  tarih = '';

  kaydet() {
    this.dialogRef.close({
      title: this.baslik,
      description: this.aciklama,
      deadline: this.tarih,
    });
  }

  iptal() {
    this.dialogRef.close();
  }
}