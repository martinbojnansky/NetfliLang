import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    MatCardModule,
    MatSlideToggleModule,
    MatListModule,
    MatButtonModule,
  ],
  exports: [
    MatCardModule,
    MatSlideToggleModule,
    MatListModule,
    MatButtonModule,
  ],
})
export class MaterialModule {}
