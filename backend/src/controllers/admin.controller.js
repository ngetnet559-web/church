import * as userService from '../services/user.service.js';

export const createUser = async (req, res) => {
  const user = await userService.createUser(req.body);

  res.status(201).json({
    success: true,
    data: { user },
  });
};

export const getUsers = async (_req, res) => {
  const users = await userService.getAllUsers();

  res.status(200).json({
    success: true,
    data: { users },
  });
};

export const updateUser = async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user);

  res.status(200).json({
    success: true,
    data: { user },
  });
};

export const deleteUser = async (req, res) => {
  const user = await userService.deactivateUser(req.params.id, req.user);

  res.status(200).json({
    success: true,
    data: { user },
    message: 'User deactivated successfully',
  });
};
