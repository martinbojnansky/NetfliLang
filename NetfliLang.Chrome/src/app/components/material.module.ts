import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';

@NgModule({
  imports: [
    MatButtonModule,
    MatCardModule,
    MatSlideToggleModule,
    MatListModule,
  ],
  exports: [
    MatCardModule,
    MatSlideToggleModule,
    MatListModule,
    MatButtonModule,
  ],
})
export class MaterialModule {}
