import React, { createContext, useContext, useState, ReactNode } from "react";

interface AppState {
  selectedProjectId: string | undefined;
  setSelectedProjectId: (id: string | undefined) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppStoreProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);

  return (
    <AppContext.Provider value={{ selectedProjectId, setSelectedProjectId }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppStore deve ser usado dentro de um AppStoreProvider");
  }
  return context;
};
