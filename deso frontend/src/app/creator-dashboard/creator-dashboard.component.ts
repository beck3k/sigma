import { Component, OnInit } from '@angular/core';
import { GlobalVarsService } from '../global-vars.service';
import { HttpClient } from '@angular/common/http';
import { Router , NavigationExtras} from "@angular/router";
import { ActivatedRoute } from '@angular/router';
import { BackendApiService } from '../backend-api.service';
@Component({
  selector: 'app-creator-dashboard',
  templateUrl: './creator-dashboard.component.html',
  styleUrls: ['./creator-dashboard.component.scss']
})
export class CreatorDashboardComponent implements OnInit {

  constructor(public globalVars: GlobalVarsService, private http: HttpClient, private router: Router, private route: ActivatedRoute, private backendApi: BackendApiService) { }
  streamKey
  streamerUsername
  streamerProfile
  // deny access if they dont have appropriate permissions
  // add price component // add go to creator dashboard on that componet
  ngOnInit(): void {
    this.globalVars._updateDeSoExchangeRate()
    this.route.paramMap.subscribe(params => {
      this.streamerUsername = params.get("username")
      this.getStreamKey()
    })
  }

  getStreamKey() {
    this.backendApi.GetSingleProfile(this.globalVars.localNode, "", this.streamerUsername).subscribe(
      (res) => {
        this.streamerProfile = res.Profile;
        console.log("called")
        this.http.get(`http://149.159.16.161:3123/private/stream/${this.streamerProfile.PublicKeyBase58Check}`).subscribe((data: {stream: {streamKey}})=>{this.streamKey = data.stream.streamKey})})}

  resetStreamKey() {
    this.http.post("http://149.159.16.161:3123/stream", { username: this.globalVars.loggedInUser.ProfileEntryResponse.Username, publicKey: this.globalVars.loggedInUser.PublicKeyBase58Check }).subscribe((data: {streamKey}) => {
    console.log(data)  
    this.streamKey=data.streamKey
  console.log(this.streamKey)})
    }

  backToSigma() {
    this.router.navigate(['/'])
  }

}