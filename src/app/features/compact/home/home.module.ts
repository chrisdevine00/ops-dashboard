import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

// Lucide Icons
import { LucideAngularModule, Search, Home, Maximize2, LayoutGrid } from 'lucide-angular';

// Components
import { HomeComponent } from './components/home/home.component';
import { RegionTableComponent } from './components/region-table/region-table.component';

const routes: Routes = [
  { path: '', component: HomeComponent }
];

@NgModule({
  declarations: [
    HomeComponent,
    RegionTableComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    // Material
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    // Lucide
    LucideAngularModule.pick({ Search, Home, Maximize2, LayoutGrid })
  ]
})
export class HomeModule { }
