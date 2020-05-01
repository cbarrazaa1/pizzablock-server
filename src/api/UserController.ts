import fetch from 'node-fetch';
import {SERVER_URL} from './Config';

type UpdateUserOptions = {
  game_id: string;
};

async function updateUserById(
  id: string,
  options: UpdateUserOptions,
): Promise<boolean> {
  const res = await fetch(`${SERVER_URL}}/update/user/${id}`, {
    method: 'PUT',
    body: JSON.stringify(options),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res.status === 200;
}

type UpdateUsersOptions = {
  user_list: string[];
  game_id: string;
};

async function updateUsersByIDs(options: UpdateUsersOptions): Promise<boolean> {
  const res = await fetch(`${SERVER_URL}/update/user-game`, {
    method: 'PUT',
    body: JSON.stringify(options),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res.status === 201;
}

export const UserController = {
  updateUserById,
  updateUsersByIDs,
};
