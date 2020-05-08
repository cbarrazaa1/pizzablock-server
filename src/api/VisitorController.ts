import fetch from 'node-fetch';
import {SERVER_URL} from './Config';

type CreateVisitorMultipleOptions = {
  ip_addresses_list: string[];
};

async function createVisitors(
  options: CreateVisitorMultipleOptions,
): Promise<boolean> {
  const res = await fetch(`${SERVER_URL}/create/visitor/multiple`, {
    method: 'POST',
    body: JSON.stringify(options),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res.status === 201;
}

export const VisitorController = {
  createVisitors,
};
