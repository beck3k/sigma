import { Component, OnInit } from '@angular/core';
import { GlobalVarsService } from '../global-vars.service';
import { ThemeService } from '../theme/theme.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {

  constructor(public globalVars: GlobalVarsService, public themeService: ThemeService, private router: Router) { }

  selectChangeHandler(event: any) {
    const newTheme = event.target.value;
    this.themeService.setTheme(newTheme);
  }

  ngOnInit(): void {
  }

  goBackToChannel() {
    this.router.navigate([`/${this.globalVars.loggedInUser.ProfileEntryResponse.Username}`])
  }

  backToSigma() {
    this.router.navigate(['/'])
  }

}
