import { Component, HostListener, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";
import { Router, ActivatedRoute } from "@angular/router";
import { BackendApiService } from "../backend-api.service";
import { HttpClient } from "@angular/common/http";

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
  followedStreamersList
  followedUsernameStreamersList = []
  @Input() streamerProfile = {PublicKeyBase58Check: ""}
  @Output() accountChanged = new EventEmitter()
  mobile = false;
  @Output() streamChanged = new EventEmitter()

  @HostListener("window:resize") onResize() {
    this.setMobileBasedOnViewport();
  }

  onAccountChange() {
    this.followedStreamers()
    this.accountChanged.emit()
  }

  constructor(private http: HttpClient, public globalVars: GlobalVarsService, private router: Router, private backendApi: BackendApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.setMobileBasedOnViewport();
    this.followedStreamers()
  }

  followedStreamers() {
    this.backendApi.jwtGet('http://149.159.16.161:3123', '/following', this.globalVars.loggedInUser.PublicKeyBase58Check).subscribe((data)=>{
      this.followedStreamersList=data
      for (let i=0; i<10 || i<this.followedStreamers.length; i++) {
        console.log(this.followedStreamersList.following[i])
        this.backendApi.GetSingleProfile(this.globalVars.localNode, this.followedStreamersList.following[i], "").subscribe((data)=>{
        this.followedUsernameStreamersList.push(data.Profile.Username)})
      }
      console.log(this.followedUsernameStreamersList)
      console.log(this.followedStreamersList)
    })
  }

  redirectToHomePage() {
    console.log("clicked")
    this.router.navigate(['/'])
  }

  changeStream(newStreamerPublicKey) {
    this.backendApi.GetSingleProfile(this.globalVars.localNode, newStreamerPublicKey, "").subscribe(
      (res) => {
      this.streamChanged.emit()
      this.router.navigate(['../',res.Profile.Username],{relativeTo: this.route})})
      this.followedStreamers()
  }

  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }
}
