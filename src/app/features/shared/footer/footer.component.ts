import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  @Input() variant: 'compact' | 'full' = 'full';

  readonly appVersion = '0.0.0';
  readonly environment = 'DEV';
  readonly year = new Date().getFullYear();
}
