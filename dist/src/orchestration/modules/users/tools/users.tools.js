"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTools = exports.deleteUserTool = exports.changeUserPasswordTool = exports.updateUserProfileTool = exports.getUserProfileTool = void 0;
const tool_wrapper_1 = require("../../../utils/tool-wrapper");
const get_user_profile_service_1 = require("./get-user-profile/get-user-profile.service");
const update_user_profile_service_1 = require("./update-user-profile/update-user-profile.service");
const change_user_password_service_1 = require("./change-user-password/change-user-password.service");
const delete_user_service_1 = require("./delete-user/delete-user.service");
const getUserProfileService = new get_user_profile_service_1.GetUserProfileService();
const updateUserProfileService = new update_user_profile_service_1.UpdateUserProfileService();
const changeUserPasswordService = new change_user_password_service_1.ChangeUserPasswordService();
const deleteUserService = new delete_user_service_1.DeleteUserService();
exports.getUserProfileTool = (0, tool_wrapper_1.createScryTool)((input, state) => getUserProfileService.execute(input, state), {
    name: 'get_user_profile',
    description: 'Retrieves user profile information including statistics.',
    schema: getUserProfileService.getSchema(),
});
exports.updateUserProfileTool = (0, tool_wrapper_1.createScryTool)((input, state) => updateUserProfileService.execute(input, state), {
    name: 'update_user_profile',
    description: 'Updates user profile with validation.',
    schema: updateUserProfileService.getSchema(),
});
exports.changeUserPasswordTool = (0, tool_wrapper_1.createScryTool)((input, state) => changeUserPasswordService.execute(input, state), {
    name: 'change_user_password',
    description: 'Changes user password with secure bcrypt hashing and confirmation.',
    schema: changeUserPasswordService.getSchema(),
});
exports.deleteUserTool = (0, tool_wrapper_1.createScryTool)((input, state) => deleteUserService.execute(input, state), {
    name: 'delete_user',
    description: 'Deletes user account with confirmation message.',
    schema: deleteUserService.getSchema(),
});
exports.userTools = [
    exports.getUserProfileTool,
    exports.updateUserProfileTool,
    exports.changeUserPasswordTool,
    exports.deleteUserTool,
];
//# sourceMappingURL=users.tools.js.map