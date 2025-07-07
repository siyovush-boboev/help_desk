import { useContext } from "react";
import { AuthContext } from "../contexts/authBS";

export const useAuth = () => useContext(AuthContext);
