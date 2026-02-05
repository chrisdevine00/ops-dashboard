import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';

// Lucide Icons
import { LucideAngularModule, Home, RefreshCw, ChevronLeft, ChevronRight, Calendar, Minimize2, LayoutGrid } from 'lucide-angular';

// ECharts
import { NgxEchartsModule } from 'ngx-echarts';

// Components
import { DashboardComponent } from './components/dashboard/dashboard.component';

const routes: Routes = [
  { path: '', component: DashboardComponent }
];

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    // Material
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    // Lucide
    LucideAngularModule.pick({ Home, RefreshCw, ChevronLeft, ChevronRight, Calendar, Minimize2, LayoutGrid }),
    // ECharts
    NgxEchartsModule.forChild()
  ]
})
export class FullDashboardModule { }
