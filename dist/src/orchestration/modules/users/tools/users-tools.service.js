"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersToolsService = void 0;
const common_1 = require("@nestjs/common");
const change_user_password_service_1 = require("./change-user-password/change-user-password.service");
const delete_user_service_1 = require("./delete-user/delete-user.service");
const get_user_profile_service_1 = require("./get-user-profile/get-user-profile.service");
const update_user_profile_service_1 = require("./update-user-profile/update-user-profile.service");
let UsersToolsService = class UsersToolsService {
    changeUserPasswordService;
    deleteUserService;
    getUserProfileService;
    updateUserProfileService;
    constructor(changeUserPasswordService, deleteUserService, getUserProfileService, updateUserProfileService) {
        this.changeUserPasswordService = changeUserPasswordService;
        this.deleteUserService = deleteUserService;
        this.getUserProfileService = getUserProfileService;
        this.updateUserProfileService = updateUserProfileService;
    }
    getTools() {
        return [
            this.getChangeUserPasswordTool(),
            this.getDeleteUserTool(),
            this.getGetUserProfileTool(),
            this.getUpdateUserProfileTool(),
        ];
    }
    getChangeUserPasswordTool() {
        return {
            service: this.changeUserPasswordService,
            name: 'change_user_password',
            description: 'Changes user password with secure bcrypt hashing and confirmation.',
        };
    }
    getDeleteUserTool() {
        return {
            service: this.deleteUserService,
            name: 'delete_user',
            description: 'Deletes user account with confirmation message.',
        };
    }
    getGetUserProfileTool() {
        return {
            service: this.getUserProfileService,
            name: 'get_user_profile',
            description: 'Retrieves user profile information including statistics.',
        };
    }
    getUpdateUserProfileTool() {
        return {
            service: this.updateUserProfileService,
            name: 'update_user_profile',
            description: 'Updates user profile with validation.',
        };
    }
};
exports.UsersToolsService = UsersToolsService;
exports.UsersToolsService = UsersToolsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [change_user_password_service_1.ChangeUserPasswordService,
        delete_user_service_1.DeleteUserService,
        get_user_profile_service_1.GetUserProfileService,
        update_user_profile_service_1.UpdateUserProfileService])
], UsersToolsService);
//# sourceMappingURL=users-tools.service.js.map