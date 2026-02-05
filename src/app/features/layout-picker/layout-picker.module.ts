import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { LayoutPickerComponent } from './layout-picker.component';

const routes: Routes = [
  { path: '', component: LayoutPickerComponent }
];

@NgModule({
  declarations: [
    LayoutPickerComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class LayoutPickerModule { }
