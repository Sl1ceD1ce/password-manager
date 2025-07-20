import { useState } from "react";
import { UserContext } from "./UserContext";

export default function UserContextProvider({ children }) {
  const [userInfo, setUserInfo] = useState(null);
  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>);
}