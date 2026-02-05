import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/layout-picker/layout-picker.module').then(m => m.LayoutPickerModule)
  },
  // Compact layout (optimized for 4-up control room display)
  {
    path: 'compact/home',
    loadChildren: () => import('./features/compact/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'compact/system/:serialNumber',
    loadChildren: () => import('./features/compact/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  // Full layout (standard workstation view)
  {
    path: 'full/home',
    loadChildren: () => import('./features/full/home/home.module').then(m => m.FullHomeModule)
  },
  {
    path: 'full/system/:serialNumber',
    loadChildren: () => import('./features/full/dashboard/dashboard.module').then(m => m.FullDashboardModule)
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
