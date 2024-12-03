import { supabase } from "./supabase.js";

const getUsers = async () => {
  const { data, error } = await supabase.from("users").select("*");

  if (error) {
    console.error("Error fetching users:", error);
  } else {
    console.log("Users:", data);
  }
};

getUsers();
