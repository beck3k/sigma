import { Component, OnInit } from '@angular/core';
import { GlobalVarsService } from '../global-vars.service';
import { ThemeService } from '../theme/theme.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {

  constructor(public globalVars: GlobalVarsService, public themeService: ThemeService) { }

  selectChangeHandler(event: any) {
    const newTheme = event.target.value;
    this.themeService.setTheme(newTheme);
  }

  ngOnInit(): void {
  }

}
