import DataLoader from "dataloader";
import * as OddsModel from "../models/odds";
import * as UsersModel from "../models/users";
import {
  LinesHistoryRowRead,
  UserLinesRowRead,
  UsersRowRead,
} from "../generated/database";

const users = async (uids: readonly string[]) => {
  const results: UsersRowRead[] = await UsersModel.listByUids([...uids]);
  return uids.map((uid: string) => results.find((user) => user.uid === uid));
};

const userLines = async (uids: readonly string[]) => {
  const results: UserLinesRowRead[] = await OddsModel.listUserLinesByUids([
    ...uids,
  ]);
  return uids.map((uid: string) =>
    results.find((userLine) => userLine.uid === uid)
  );
};

const lines = async (uids: readonly string[]) => {
  const results: LinesHistoryRowRead[] = await OddsModel.listLinesHistoryByUids(
    [...uids]
  );
  return uids.map((uid: string) => results.find((line) => line.uid === uid));
};

export default function createLoaders() {
  return {
    users: new DataLoader(users),
    userLines: new DataLoader(userLines),
    lines: new DataLoader(lines),
  };
}
