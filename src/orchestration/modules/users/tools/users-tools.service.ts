import { Injectable } from '@nestjs/common';
import { ChangeUserPasswordService } from './change-user-password/change-user-password.service';
import { DeleteUserService } from './delete-user/delete-user.service';
import { GetUserProfileService } from './get-user-profile/get-user-profile.service';
import { UpdateUserProfileService } from './update-user-profile/update-user-profile.service';

@Injectable()
export class UsersToolsService {
  constructor(
    private changeUserPasswordService: ChangeUserPasswordService,
    private deleteUserService: DeleteUserService,
    private getUserProfileService: GetUserProfileService,
    private updateUserProfileService: UpdateUserProfileService,
  ) {}

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
      description:
        'Changes user password with secure bcrypt hashing and confirmation.',
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
}
