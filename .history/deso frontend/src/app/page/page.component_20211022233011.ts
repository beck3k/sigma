import { Component, HostListener, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";
import { Router, ActivatedRoute } from "@angular/router";
import { BackendApiService } from "../backend-api.service";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";

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
  @Input() streamerProfile = { PublicKeyBase58Check: "" } // might be problematic -- check the html
  @Output() accountChanged = new EventEmitter()
  mobile = false;
  @Output() streamChanged = new EventEmitter()

  @HostListener("window:resize") onResize() {
    this.setMobileBasedOnViewport();
  }

  onAccountChange() {
    this.followedUsernameStreamersList = []
    this.followedStreamers()
    this.accountChanged.emit()
  }

  constructor(private http: HttpClient, public globalVars: GlobalVarsService, private router: Router, private backendApi: BackendApiService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.setMobileBasedOnViewport();
    this.followedStreamers()
  }

  followedStreamers() {
    this.backendApi.jwtGet(`${environment.apiURL}`, '/following', this.globalVars.loggedInUser.PublicKeyBase58Check).subscribe((data) => {
      this.followedStreamersList = data
      console.log("streamers:", this.followedStreamersList)
      for (let i = 0; i < 10 && i < this.followedStreamersList.following.length; i++) {
        console.log(this.followedStreamersList.following[i])
        this.backendApi.GetSingleProfile(this.globalVars.localNode, this.followedStreamersList.following[i], "").subscribe((data) => {
          console.log(data)
          this.followedUsernameStreamersList.push({ username: data.Profile.Username, publicKey: this.followedStreamersList.following[i] })
          this.backendApi.GetSingleProfilePicture(this.globalVars.localNode,
            this.followedStreamersList.following[i]).subscribe((res) => {
              console.log("res received!")
              this._readImageFileToProfilePicInput(res)
            })
        })
      }

    })
  }

  goToMessages() {
    this.router.navigate(['/messages'])
  }

  redirectToHomePage() {
    console.log("clicked")
    this.router.navigate(['/'])
  }

  goToNotification() {
    this.router.navigate(['/notifications'])
  }

  changeStream(newStreamerPublicKey) {
    console.log("clic")
    this.streamChanged.emit()
    this.router.navigate([newStreamerPublicKey])
    this.followedStreamers()
  }

  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }
  profilePicCounter = 0
  _readImageFileToProfilePicInput(file: Blob | File) {
    console.log("here")
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event: any) => {
      const base64Image = btoa(event.target.result);
      this.followedUsernameStreamersList[this.profilePicCounter].profilePicture = `data:${file.type};base64,${base64Image}`;
      console.log("picture:",`data:${file.type};base64,${base64Image}`)
      this.profilePicCounter++
    };
  }

}
