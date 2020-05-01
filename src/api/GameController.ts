import fetch from 'node-fetch';
import { SERVER_URL } from './Config';

type MongoID = string;
type CreateGameOptions = {
  mode_id: string;
  money_pool: number;
}

async function createGame(options: CreateGameOptions): Promise<MongoID> {
  const res = await fetch(`${SERVER_URL}/create/game`, {
    method: 'POST',
    body: JSON.stringify(options),
    headers: {
      'Content-Type': 'application/json',
    },
  }); 

  const json = await res.json();
  return json._id;
}

type UpdateGameOptions = {
  user_id_list: string[];
  winner: string;
};

async function updateGameById(id: string, options: UpdateGameOptions): Promise<boolean> {
  const res = await fetch(`${SERVER_URL}/update/game/${id}`, {
    method: 'PUT',
    body: JSON.stringify(options),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res.status === 200;
}

export const GameController = {
  createGame,
  updateGameById,
};
