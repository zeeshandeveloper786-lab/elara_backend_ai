import { createScryTool } from '../../../utils/tool-wrapper';
import { GetUserProfileService } from './get-user-profile/get-user-profile.service';
import { UpdateUserProfileService } from './update-user-profile/update-user-profile.service';
import { ChangeUserPasswordService } from './change-user-password/change-user-password.service';
import { DeleteUserService } from './delete-user/delete-user.service';

// Create services for tool creation
const getUserProfileService = new GetUserProfileService();
const updateUserProfileService = new UpdateUserProfileService();
const changeUserPasswordService = new ChangeUserPasswordService();
const deleteUserService = new DeleteUserService();

// Get User Profile Tool
export const getUserProfileTool = createScryTool(
  (input: any, state: any) => getUserProfileService.execute(input, state),
  {
    name: 'get_user_profile',
    description: 'Retrieves user profile information including statistics.',
    schema: getUserProfileService.getSchema(),
  },
);

// Update User Profile Tool
export const updateUserProfileTool = createScryTool(
  (input: any, state: any) => updateUserProfileService.execute(input, state),
  {
    name: 'update_user_profile',
    description: 'Updates user profile with validation.',
    schema: updateUserProfileService.getSchema(),
  },
);

// Change User Password Tool
export const changeUserPasswordTool = createScryTool(
  (input: any, state: any) => changeUserPasswordService.execute(input, state),
  {
    name: 'change_user_password',
    description:
      'Changes user password with secure bcrypt hashing and confirmation.',
    schema: changeUserPasswordService.getSchema(),
  },
);

// Delete User Tool
export const deleteUserTool = createScryTool(
  (input: any, state: any) => deleteUserService.execute(input, state),
  {
    name: 'delete_user',
    description: 'Deletes user account with confirmation message.',
    schema: deleteUserService.getSchema(),
  },
);

// User tools array for use in orchestration
export const userTools = [
  getUserProfileTool,
  updateUserProfileTool,
  changeUserPasswordTool,
  deleteUserTool,
];
