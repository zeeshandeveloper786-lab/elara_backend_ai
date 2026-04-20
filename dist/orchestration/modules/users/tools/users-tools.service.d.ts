import { ChangeUserPasswordService } from './change-user-password/change-user-password.service';
import { DeleteUserService } from './delete-user/delete-user.service';
import { GetUserProfileService } from './get-user-profile/get-user-profile.service';
import { UpdateUserProfileService } from './update-user-profile/update-user-profile.service';
export declare class UsersToolsService {
    private changeUserPasswordService;
    private deleteUserService;
    private getUserProfileService;
    private updateUserProfileService;
    constructor(changeUserPasswordService: ChangeUserPasswordService, deleteUserService: DeleteUserService, getUserProfileService: GetUserProfileService, updateUserProfileService: UpdateUserProfileService);
    getTools(): ({
        service: ChangeUserPasswordService;
        name: string;
        description: string;
    } | {
        service: DeleteUserService;
        name: string;
        description: string;
    } | {
        service: GetUserProfileService;
        name: string;
        description: string;
    } | {
        service: UpdateUserProfileService;
        name: string;
        description: string;
    })[];
    getChangeUserPasswordTool(): {
        service: ChangeUserPasswordService;
        name: string;
        description: string;
    };
    getDeleteUserTool(): {
        service: DeleteUserService;
        name: string;
        description: string;
    };
    getGetUserProfileTool(): {
        service: GetUserProfileService;
        name: string;
        description: string;
    };
    getUpdateUserProfileTool(): {
        service: UpdateUserProfileService;
        name: string;
        description: string;
    };
}
