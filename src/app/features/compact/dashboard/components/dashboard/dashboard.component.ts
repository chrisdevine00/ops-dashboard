import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SystemsService } from '../../../../../core/services/systems.service';
import { DashboardBaseComponent } from '../../../../shared/dashboard-base.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: false,
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent extends DashboardBaseComponent {
  protected override showAllXAxes = false;

  constructor(route: ActivatedRoute, router: Router, systemsService: SystemsService) {
    super(route, router, systemsService);
  }

  goHome(): void {
    this.router.navigate(['/compact/home']);
  }
}
