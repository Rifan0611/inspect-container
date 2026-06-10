const login = () => {
  // ADMIN
  if (username === "admin" && password === "123") {
    const dataUser = {
      nama: "Administrator",
      role: "ADMIN",
      shift: "OFFICE",
    };

    setUser(dataUser);

    setRole("ADMIN");

    setPage("dashboard");

    return;
  }

  // MANAGER
  if (username === "manager" && password === "123") {
    const dataUser = {
      nama: "Manager",
      role: "MANAGER",
      shift: "PAGI",
    };

    setUser(dataUser);

    setRole("MANAGER");

    setPage("dashboard");

    return;
  }

  // SUPERVISOR
  if (username === "supervisor" && password === "123") {
    const dataUser = {
      nama: "Supervisor",
      role: "SUPERVISOR",
      shift: "PAGI",
    };

    setUser(dataUser);

    setRole("SUPERVISOR");

    setPage("dashboard");

    return;
  }

  // ASSISTANT SUPERVISOR
  if (username === "assistant" && password === "123") {
    const dataUser = {
      nama: "Assistant Supervisor",
      role: "ASSISTANT SUPERVISOR",
      shift: "PAGI",
    };

    setUser(dataUser);

    setRole("ASSISTANT SUPERVISOR");

    setPage("dashboard");

    return;
  }

  // PETUGAS
  if (
    username.trim().toLowerCase() === "petugas" &&
    password.trim() === "123"
  ) {
    const dataUser = {
      nama: "Petugas",
      role: "PETUGAS",
      shift: "PAGI",
    };

    setUser(dataUser);

    setRole("PETUGAS");

    setPage("inspection");

    return;
  }

  // LOGIN GAGAL
  alert("USERNAME ATAU PASSWORD SALAH");
};
