import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export const AppContext = createContext();


const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [credit, setCredit] = useState(0);


  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();


  // ✅ Load user's credit balance and info
  const loadCreditsData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/credits`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      if (data.success) {
        setCredit(data.credits);
        setUser(data.user);
      } else {
        toast.error(data.message || "Failed to load user data.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || error.message);
    }
  };


  // ✅ Image Generation API call
  const generateImage = async (prompt) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/image/generate-image`,
        { prompt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      if (data.success) {
        loadCreditsData(); // refresh credit balance
        return data.resultImage || data.resultImg; // ensure return image key
      } else {
        toast.error(data.message || "Image could not be generated.");
        if (data.creditBalance === 0) {
          navigate("/buy");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Image generation failed.");
    }
  };


  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setCredit(0);
  };


  useEffect(() => {
    if (token) {
      loadCreditsData();
    }
  }, [token]);


  const value = {
    user,
    setUser,
    showLogin,
    setShowLogin,
    backendUrl,
    token,
    setToken,
    credit,
    setCredit,
    loadCreditsData,
    logout,
    generateImage,
  };


  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};


export default AppContextProvider;


