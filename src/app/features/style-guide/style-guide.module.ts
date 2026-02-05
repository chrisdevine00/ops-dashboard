import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

// Lucide Icons
import { LucideAngularModule, Home, ArrowLeft, Copy, Check } from 'lucide-angular';

// Components
import { StyleGuideComponent } from './components/style-guide/style-guide.component';

const routes: Routes = [
  { path: '', component: StyleGuideComponent }
];

@NgModule({
  declarations: [
    StyleGuideComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    // Material
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatDividerModule,
    // Lucide
    LucideAngularModule.pick({ Home, ArrowLeft, Copy, Check })
  ]
})
export class StyleGuideModule { }
