import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendApiService } from '../backend-api.service';
import { GlobalVarsService } from '../global-vars.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-following',
  templateUrl: './following.component.html',
  styleUrls: ['./following.component.scss']
})
export class FollowingComponent implements OnInit {

  constructor(private route: ActivatedRoute, private backendApi: BackendApiService, private globalVars: GlobalVarsService, private http: HttpClient) { }
  targetUsername
  targetProfile
  targetPublicKey
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.targetUsername = params.username;
      this.backendApi.GetSingleProfile(this.globalVars.localNode, "", this.targetUsername).subscribe((data) => {
        this.targetProfile = data.Profile
        this.targetPublicKey = this.targetProfile.PublicKeyBase58Check
        this.getFollowingProfiles()
      })
    })
  }

  followingPublicKeys
  followingProfiles

  async getFollowingProfiles() {
    this.followingPublicKeys = await this.http.get(`${environment.apiURL}/following`, {headers: {'publickeybase58check': this.targetPublicKey}}).toPromise()

    for (let i = 0; i < this.followingPublicKeys.length; i++) {
      await this.backendApi.GetSingleProfile(this.globalVars.localNode, "", this.followingPublicKeys[i]).subscribe((data) => {
        this.followingProfiles[i] = data.Profile
      })
      this.backendApi.GetSingleProfilePicture(this.globalVars.localNode, "", this.followingPublicKeys[i]).subscribe((data) => {
        console.log(data)
        this.followingProfiles[i].ProfilePicture = data.ProfilePicture
      })
      console.log(this.followingProfiles[i])
    }
  }

}