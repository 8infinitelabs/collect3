import { v4 as secure } from '@lukeed/uuid/secure';
import { getFromStorage, setToStorage } from './storage';
import { ID_KEY, Metadata } from './utils';

export const createUserUid = async () => {
  const id = secure();
  await setToStorage(ID_KEY, id)
};

export const getUserUid = async () => {
  const id = await getFromStorage(ID_KEY);
  return id;
};

export const uploadFile = async (file: string, metadata: Metadata) => {
  const auth_token = "S5ApryAPz........"
  const content = {
    ...metadata,
    content: file,
  }
  //TODO: change to cookies
  const raw = await fetch("http://localhost:8080/upload", {
    method: "POST",
    body: JSON.stringify({
      file: JSON.stringify(content),
      auth_token,
    }),
  });
  const response: {cid: string} = await raw.json()

  //TODO: save cid
};

export const downloadFile = async (cid: string) => {
  //TODO: change to cookies or credentials api
  const auth_token = "S5ApryAPz........"
  const raw = await fetch("http://localhost:8080/download", {
    method: "POST",
    body: JSON.stringify({
      cid,
      auth_token,
    }),
  });
  //TODO: parse and save file
};

export const createAccount = async () => {
  const uid = await getUserUid();
  const raw = await fetch("http://localhost:8080/create_account", {
    method: "POST",
    body: JSON.stringify({
      uid,
    }),
  });
  const response: {id: string, auth_token: string} = await raw.json();
}

export const createToken = async () => {
  const uid = await getUserUid();
  const raw = await fetch("http://localhost:8080/create_token", {
    method: "POST",
    body: JSON.stringify({
      uid,
    }),
  });
  const response: {auth_token: string} = await raw.json();
}
