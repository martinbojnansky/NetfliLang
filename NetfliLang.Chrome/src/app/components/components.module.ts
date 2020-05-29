import { NgModule } from '@angular/core';
import { MaterialModule } from './material.module';
import { SelectionListComponent } from './selection-list/selection-list.component';
import { CommonModule } from '@angular/common';
import { IconsModule } from './icons.module';

@NgModule({
  imports: [CommonModule, MaterialModule, IconsModule],
  declarations: [SelectionListComponent],
  exports: [MaterialModule, IconsModule, SelectionListComponent],
})
export class ComponentsModule {}
