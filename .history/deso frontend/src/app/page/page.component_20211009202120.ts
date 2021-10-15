import { Component, HostListener, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-page",
  templateUrl: "./page.component.html",
  styleUrls: ["./page.component.scss"],
})
export class PageComponent implements OnInit {
  @Input() hideSidebar: string;
  @Input() showPostButton = false;
  @Input() inTutorial: boolean = false;
  @Input() settings = false
  @Input() creatorDashboard = false
  @Input() backToSigma = false
  @Input() channel = false
  @Input() followedStreamersList = {following: []}
  @Output() accountChanged = new EventEmitter()
  mobile = false;

  @HostListener("window:resize") onResize() {
    this.setMobileBasedOnViewport();
  }

  onAccountChange() {
    this.accountChanged.emit()
  }

  constructor(public globalVars: GlobalVarsService, private router: Router) {}

  ngOnInit() {
    this.setMobileBasedOnViewport();
  }

  redirectToHomePage() {
    console.log("clicked")
    this.router.navigate(['/'])
  }

  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }
}
