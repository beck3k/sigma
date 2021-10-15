import { Component, Renderer2, ElementRef, ViewChild, Input, Output, EventEmitter } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";
import { BackendApiService } from "../backend-api.service";
import { BsModalService } from "ngx-bootstrap/modal";
import { Router } from "@angular/router";
import { IdentityService } from "../identity.service";
import { filter, get } from "lodash";

@Component({
  selector: "change-account-selector",
  templateUrl: "./change-account-selector.component.html",
  styleUrls: ["./change-account-selector.component.scss"],
})
export class ChangeAccountSelectorComponent {
  @ViewChild("changeAccountSelectorRoot", { static: true }) accountSelectorRoot: ElementRef;

  selectorOpen: boolean;
  hoverRow: number;
  @Input() input1
  @Output() input1Click = new EventEmitter();
  @Input() input2
  @Output() input2Click = new EventEmitter();
  @Output() accountChanged = new EventEmitter()

  onInput1Click() {
    this.input1Click.emit()
  }
  onInput2Click() {
    console.log("click received")
    this.input2Click.emit()
  }
  constructor(
    public globalVars: GlobalVarsService,
    private renderer: Renderer2,
    private backendApi: BackendApiService,
    private modalService: BsModalService,
    private identityService: IdentityService,
    private router: Router
  ) {
    this.selectorOpen = false;
  }

  launchLogoutFlow() {
    const publicKey = this.globalVars.loggedInUser.PublicKeyBase58Check;
    this.identityService.launch("/logout", { publicKey }).subscribe((res) => {
      this.globalVars.userList = filter(this.globalVars.userList, (user) => {
        return res?.users && user?.PublicKeyBase58Check in res?.users;
      });
      if (!res?.users) {
        this.globalVars.userList = [];
      }
      let loggedInUser = get(Object.keys(res?.users), "[0]");
      if (this.globalVars.userList.length === 0) {
        loggedInUser = null;
        this.globalVars.setLoggedInUser(null);
      }
      this.backendApi.setIdentityServiceUsers(res.users, loggedInUser);
      this.globalVars.updateEverything().add(() => {
        if (!this.globalVars.userInTutorial(this.globalVars.loggedInUser)) {
          this.router.navigate(["/" + this.globalVars.RouteNames.BROWSE]);
        }
      });
    });
  }
  
  goToSettings() {
    this.router.navigate(['settings'])
  }

  _switchToUser(user) {
    this.globalVars.setLoggedInUser(user);
    this.globalVars.messageResponse = null;
    this.accountChanged.emit()

    // Now we call update everything on the newly logged in user to make sure we have the latest info this user.
    this.globalVars.updateEverything().add(() => {
      if (!this.globalVars.userInTutorial(this.globalVars.loggedInUser)) {
      }
      this.globalVars.isLeftBarMobileOpen = false;
    });
  }
}
