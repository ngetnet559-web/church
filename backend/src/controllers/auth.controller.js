import * as userService from '../services/user.service.js';

export const login = async (req, res) => {
  const result = await userService.loginUser(req.body);

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getMe = async (req, res) => {
  const user = await userService.getCurrentUser(req.user._id);

  res.status(200).json({
    success: true,
    data: { user },
  });
};

export const logout = async (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
